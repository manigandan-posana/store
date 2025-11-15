package com.store.demo.service;

import com.store.demo.domain.InwardEntry;
import com.store.demo.domain.Material;
import com.store.demo.domain.OutwardBatchConsumption;
import com.store.demo.domain.OutwardEntry;
import com.store.demo.domain.Project;
import com.store.demo.domain.ProjectMaterial;
import com.store.demo.repository.InwardEntryRepository;
import com.store.demo.repository.OutwardEntryRepository;
import com.store.demo.repository.ProjectMaterialRepository;
import com.store.demo.service.dto.InventoryMovementReportDto;
import com.store.demo.service.dto.MaterialDetailDto;
import com.store.demo.service.dto.MaterialDto;
import com.store.demo.service.dto.MaterialStatsDto;
import com.store.demo.service.dto.MovementDto;
import com.store.demo.service.dto.ProjectDto;
import com.store.demo.service.dto.RecordInwardCommand;
import com.store.demo.service.dto.RecordOutwardCommand;
import com.store.demo.service.mapper.DtoMapper;
import com.store.demo.web.error.BadRequestException;
import com.store.demo.web.dto.InventoryAnalyticsResponse;
import com.store.demo.web.dto.MaterialConsumptionResponse;
import com.store.demo.web.dto.ProjectConsumptionResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InventoryService {

    private static final String GENERAL_STORE_LABEL = "General Store";

    private final InwardEntryRepository inwardEntryRepository;
    private final OutwardEntryRepository outwardEntryRepository;
    private final ProjectMaterialRepository projectMaterialRepository;
    private final ProjectService projectService;
    private final MaterialService materialService;
    private final DtoMapper mapper;

    public InventoryService(
            InwardEntryRepository inwardEntryRepository,
            OutwardEntryRepository outwardEntryRepository,
            ProjectMaterialRepository projectMaterialRepository,
            ProjectService projectService,
            MaterialService materialService,
            DtoMapper mapper) {
        this.inwardEntryRepository = inwardEntryRepository;
        this.outwardEntryRepository = outwardEntryRepository;
        this.projectMaterialRepository = projectMaterialRepository;
        this.projectService = projectService;
        this.materialService = materialService;
        this.mapper = mapper;
    }

    public MovementDto recordInward(RecordInwardCommand command) {
        validateQuantity(command.deliveredQuantity());
        validateQuantity(command.invoiceQuantity());
        Material material = materialService.getMaterialEntity(command.materialId());
        Project project = null;
        if (command.projectId() != null) {
            project = projectService.getProjectEntity(command.projectId());
            ensureMaterialLinked(project, material);
        }

        OffsetDateTime movementTime = toMovementTime(command.receiveDate());
        BigDecimal quantity = BigDecimal.valueOf(command.deliveredQuantity()).setScale(3, RoundingMode.HALF_UP);
        BigDecimal invoiceQuantity = BigDecimal.valueOf(command.invoiceQuantity()).setScale(3, RoundingMode.HALF_UP);

        InwardEntry entry = new InwardEntry();
        entry.setProject(project);
        entry.setMaterial(material);
        entry.setQuantity(quantity);
        entry.setRemainingQuantity(quantity);
        entry.setMovementTime(movementTime);
        entry.setInvoiceNumber(command.invoiceNumber());
        entry.setInvoiceDate(command.invoiceDate());
        entry.setReceiveDate(command.receiveDate());
        entry.setInvoiceQuantity(invoiceQuantity);
        entry.setVehicleNumber(command.vehicleNumber());
        entry.setSupplier(command.supplierName());
        entry.setReference(command.invoiceNumber());
        entry.setRemarks(command.remarks());
        entry.setCreatedAt(mapper.now());
        entry = inwardEntryRepository.save(entry);

        return toInwardMovement(project, material, entry);
    }

    public MovementDto recordOutward(RecordOutwardCommand command) {
        validateQuantity(command.quantity());
        Material material = materialService.getMaterialEntity(command.materialId());
        Project project = null;
        if (command.projectId() != null) {
            project = projectService.getProjectEntity(command.projectId());
            ensureMaterialLinked(project, material);
        }

        List<InwardEntry> batches = ((project != null)
                        ? inwardEntryRepository.findByProjectAndMaterialOrderByMovementTimeAsc(project, material)
                        : inwardEntryRepository.findByProjectIsNullAndMaterialOrderByMovementTimeAsc(material))
                .stream()
                .filter(batch -> batch.getRemainingQuantity().compareTo(BigDecimal.ZERO) > 0)
                .collect(Collectors.toList());
        if (batches.isEmpty()) {
            throw new BadRequestException("No stock available for material");
        }

        BigDecimal requested = BigDecimal.valueOf(command.quantity()).setScale(3, RoundingMode.HALF_UP);
        BigDecimal available = batches.stream()
                .map(InwardEntry::getRemainingQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (available.compareTo(requested) < 0) {
            throw new BadRequestException(
                    String.format(Locale.ENGLISH, "Insufficient stock. Available %.3f", available.doubleValue()));
        }

        OffsetDateTime movementTime = toMovementTime(command.handoverDate());
        OutwardEntry outwardEntry = new OutwardEntry();
        outwardEntry.setProject(project);
        outwardEntry.setMaterial(material);
        outwardEntry.setQuantity(requested);
        outwardEntry.setMovementTime(movementTime);
        outwardEntry.setHandoverDate(command.handoverDate());
        outwardEntry.setHandoverName(command.handoverName());
        outwardEntry.setHandoverDesignation(command.handoverDesignation());
        outwardEntry.setStoreInchargeName(command.storeInchargeName());
        outwardEntry.setIssuedTo(command.handoverName());
        outwardEntry.setReference(command.handoverName());
        outwardEntry.setRemarks(command.remarks());
        outwardEntry.setCreatedAt(mapper.now());

        BigDecimal remaining = requested;
        for (InwardEntry batch : batches) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }
            BigDecimal batchAvailable = batch.getRemainingQuantity();
            if (batchAvailable.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            BigDecimal consume = batchAvailable.min(remaining);
            batch.setRemainingQuantity(batchAvailable.subtract(consume));
            OutwardBatchConsumption consumption = new OutwardBatchConsumption();
            consumption.setOutwardEntry(outwardEntry);
            consumption.setInwardEntry(batch);
            consumption.setQuantity(consume);
            outwardEntry.getBatchConsumptions().add(consumption);
            remaining = remaining.subtract(consume);
        }

        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalStateException("FIFO calculation error: remaining quantity after allocation");
        }

        outwardEntry = outwardEntryRepository.save(outwardEntry);

        return toOutwardMovement(project, material, outwardEntry);
    }

    @Transactional(readOnly = true)
    public MaterialDetailDto getMaterialDetail(Long projectId, Long materialId) {
        Project project = projectService.getProjectEntity(projectId);
        Material material = materialService.getMaterialEntity(materialId);
        ensureMaterialLinked(project, material);

        MaterialStatsDto stats = buildStats(project, material);
        List<MovementDto> inwardMovements = inwardEntryRepository
                .findByProjectAndMaterialOrderByMovementTimeAsc(project, material)
                .stream()
                .map(entry -> toInwardMovement(project, material, entry))
                .collect(Collectors.toList());

        List<MovementDto> outwardMovements = outwardEntryRepository
                .findByProjectAndMaterialOrderByMovementTimeDesc(project, material)
                .stream()
                .map(entry -> toOutwardMovement(project, material, entry))
                .collect(Collectors.toList());

        List<MovementDto> history = new ArrayList<>(inwardMovements);
        history.addAll(outwardMovements);
        history.sort(Comparator.comparing(MovementDto::movementTime).reversed());

        return new MaterialDetailDto(
                mapper.toProjectDto(project),
                mapper.toMaterialDto(material),
                stats,
                inwardMovements,
                outwardMovements,
                history);
    }

    @Transactional(readOnly = true)
    public List<MaterialStatsDto> getProjectMaterialStats(Long projectId) {
        Project project = projectService.getProjectEntity(projectId);
        List<ProjectMaterial> links = projectMaterialRepository.findByProject(project);
        return links.stream().map(link -> buildStats(project, link.getMaterial())).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MaterialStatsDto> getGeneralMaterialStats() {
        java.util.Set<Long> materialIds = new java.util.LinkedHashSet<>();
        inwardEntryRepository.findByProjectIsNull().forEach(entry -> materialIds.add(entry.getMaterial().getId()));
        outwardEntryRepository.findByProjectIsNull().forEach(entry -> materialIds.add(entry.getMaterial().getId()));
        return materialIds.stream()
                .map(materialService::getMaterialEntity)
                .map(material -> buildStats(null, material))
                .sorted(Comparator.comparing(MaterialStatsDto::materialName))
                .toList();
    }

    public ProjectDto getGeneralProjectDescriptor() {
        return generalProjectDto();
    }

    @Transactional(readOnly = true)
    public List<MovementDto> getRecentActivity(Long projectId, int limit) {
        List<MovementDto> movements = new ArrayList<>();
        if (projectId != null && projectId > 0) {
            Project project = projectService.getProjectEntity(projectId);
            movements.addAll(inwardEntryRepository
                    .findByProject(project)
                    .stream()
                    .map(entry -> toInwardMovement(project, entry.getMaterial(), entry))
                    .toList());
            movements.addAll(outwardEntryRepository
                    .findByProject(project)
                    .stream()
                    .map(entry -> toOutwardMovement(project, entry.getMaterial(), entry))
                    .toList());
        } else if (projectId != null && projectId == 0L) {
            movements.addAll(inwardEntryRepository.findByProjectIsNull().stream()
                    .map(entry -> toInwardMovement(null, entry.getMaterial(), entry))
                    .toList());
            movements.addAll(outwardEntryRepository.findByProjectIsNull().stream()
                    .map(entry -> toOutwardMovement(null, entry.getMaterial(), entry))
                    .toList());
        } else {
            movements.addAll(inwardEntryRepository.findAll().stream()
                    .map(entry -> toInwardMovement(entry.getProject(), entry.getMaterial(), entry))
                    .toList());
            movements.addAll(outwardEntryRepository.findAll().stream()
                    .map(entry -> toOutwardMovement(entry.getProject(), entry.getMaterial(), entry))
                    .toList());
        }

        movements.sort(Comparator.comparing(MovementDto::movementTime).reversed());
        if (movements.size() > limit) {
            return movements.subList(0, limit);
        }
        return movements;
    }

    @Transactional(readOnly = true)
    public InventoryAnalyticsResponse getInventoryAnalytics() {
        long totalProjects = projectService.findAll().size();
        long totalMaterials = materialService.findAll().size();

        BigDecimal totalQuantityIn = Optional.ofNullable(inwardEntryRepository.sumAllQuantity())
                .orElse(BigDecimal.ZERO);
        BigDecimal totalQuantityOut = Optional.ofNullable(outwardEntryRepository.sumAllQuantity())
                .orElse(BigDecimal.ZERO);
        BigDecimal totalQuantityOnHand = Optional.ofNullable(inwardEntryRepository.sumAllRemainingQuantity())
                .orElse(BigDecimal.ZERO);

        BigDecimal totalWeightIn = Optional.ofNullable(inwardEntryRepository.sumAllWeight())
                .orElse(BigDecimal.ZERO);
        BigDecimal totalWeightOut = Optional.ofNullable(outwardEntryRepository.sumAllWeight())
                .orElse(BigDecimal.ZERO);
        BigDecimal totalWeightOnHand = totalWeightIn.subtract(totalWeightOut);

        long totalUnitsIn = Optional.ofNullable(inwardEntryRepository.sumAllUnits()).orElse(0L);
        long totalUnitsOut = Optional.ofNullable(outwardEntryRepository.sumAllUnits()).orElse(0L);
        long totalUnitsOnHand = totalUnitsIn - totalUnitsOut;

        return new InventoryAnalyticsResponse(
                totalProjects,
                totalMaterials,
                totalQuantityIn.doubleValue(),
                totalQuantityOut.doubleValue(),
                totalQuantityOnHand.doubleValue(),
                toDouble(totalWeightIn),
                toDouble(totalWeightOut),
                toDouble(totalWeightOnHand),
                totalUnitsIn,
                totalUnitsOut,
                totalUnitsOnHand,
                buildProjectConsumption());
    }

    @Transactional(readOnly = true)
    public InventoryMovementReportDto getInventoryMovementReport(Long projectId) {
        List<ProjectDto> projects = new ArrayList<>();
        projects.add(generalProjectDto());
        projects.addAll(projectService.findAll());

        boolean generalOnly = projectId != null && projectId == 0L;
        final Project selectedProjectEntity = projectId != null && projectId > 0
                ? projectService.getProjectEntity(projectId)
                : null;
        final ProjectDto selectedProject;
        if (generalOnly) {
            selectedProject = generalProjectDto();
        } else if (selectedProjectEntity != null) {
            selectedProject = mapper.toProjectDto(selectedProjectEntity);
        } else {
            selectedProject = null;
        }

        List<MovementDto> movements = new ArrayList<>();
        if (generalOnly) {
            movements.addAll(inwardEntryRepository.findByProjectIsNull().stream()
                    .map(entry -> toInwardMovement(null, entry.getMaterial(), entry))
                    .toList());
            movements.addAll(outwardEntryRepository.findByProjectIsNull().stream()
                    .map(entry -> toOutwardMovement(null, entry.getMaterial(), entry))
                    .toList());
        } else if (selectedProjectEntity != null) {
            movements.addAll(inwardEntryRepository.findByProject(selectedProjectEntity).stream()
                    .map(entry -> toInwardMovement(selectedProjectEntity, entry.getMaterial(), entry))
                    .toList());
            movements.addAll(outwardEntryRepository.findByProject(selectedProjectEntity).stream()
                    .map(entry -> toOutwardMovement(selectedProjectEntity, entry.getMaterial(), entry))
                    .toList());
        } else {
            movements.addAll(inwardEntryRepository.findAll().stream()
                    .map(entry -> toInwardMovement(entry.getProject(), entry.getMaterial(), entry))
                    .toList());
            movements.addAll(outwardEntryRepository.findAll().stream()
                    .map(entry -> toOutwardMovement(entry.getProject(), entry.getMaterial(), entry))
                    .toList());
        }

        movements.sort(Comparator.comparing(MovementDto::movementTime).reversed());

        double totalInQuantity = movements.stream()
                .filter(movement -> "IN".equals(movement.type()))
                .mapToDouble(MovementDto::quantity)
                .sum();
        double totalOutQuantity = movements.stream()
                .filter(movement -> "OUT".equals(movement.type()))
                .mapToDouble(MovementDto::quantity)
                .sum();

        return new InventoryMovementReportDto(projects, selectedProject, movements, totalInQuantity, totalOutQuantity);
    }

    private List<ProjectConsumptionResponse> buildProjectConsumption() {
        return outwardEntryRepository.findAll().stream()
                .filter(entry -> entry.getProject() != null)
                .collect(Collectors.groupingBy(OutwardEntry::getProject, Collectors.groupingBy(OutwardEntry::getMaterial)))
                .entrySet()
                .stream()
                .map(projectEntry -> new ProjectConsumptionResponse(
                        projectEntry.getKey().getId(),
                        projectEntry.getKey().getName(),
                        projectEntry.getValue().entrySet().stream()
                                .map(materialEntry -> {
                                    BigDecimal quantityTotal = materialEntry.getValue().stream()
                                            .map(OutwardEntry::getQuantity)
                                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                                    BigDecimal weightTotal = materialEntry.getValue().stream()
                                            .map(OutwardEntry::getWeightTons)
                                            .filter(Objects::nonNull)
                                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                                    long unitsTotal = materialEntry.getValue().stream()
                                            .map(OutwardEntry::getUnitsCount)
                                            .filter(Objects::nonNull)
                                            .mapToLong(Integer::longValue)
                                            .sum();
                                    Double weightValue = weightTotal.compareTo(BigDecimal.ZERO) == 0
                                            ? null
                                            : weightTotal.doubleValue();
                                    Long unitsValue = unitsTotal == 0 ? null : unitsTotal;
                                    return new MaterialConsumptionResponse(
                                            materialEntry.getKey().getId(),
                                            materialEntry.getKey().getName(),
                                            quantityTotal.doubleValue(),
                                            weightValue,
                                            unitsValue);
                                })
                                .sorted(Comparator.comparing(MaterialConsumptionResponse::materialName))
                                .toList()))
                .sorted(Comparator.comparing(ProjectConsumptionResponse::projectName))
                .toList();
    }

    private void ensureMaterialLinked(Project project, Material material) {
        if (project == null) {
            return;
        }
        boolean linked = projectMaterialRepository.existsByProjectAndMaterial(project, material);
        if (!linked) {
            throw new BadRequestException("Material is not linked with project");
        }
    }

    private ProjectDto generalProjectDto() {
        return new ProjectDto(0L, "GENERAL", GENERAL_STORE_LABEL, "–", "Standalone", "Unassigned stock movements", null, null);
    }

    private MaterialStatsDto buildStats(Project project, Material material) {
        if (project == null) {
            List<InwardEntry> generalInwards = inwardEntryRepository
                    .findByProjectIsNullAndMaterialOrderByMovementTimeAsc(material);
            List<OutwardEntry> generalOutwards = outwardEntryRepository
                    .findByProjectIsNullAndMaterialOrderByMovementTimeDesc(material);

            BigDecimal totalIn = generalInwards.stream()
                    .map(InwardEntry::getQuantity)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalOut = generalOutwards.stream()
                    .map(OutwardEntry::getQuantity)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalInWeight = generalInwards.stream()
                    .map(InwardEntry::getWeightTons)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalOutWeight = generalOutwards.stream()
                    .map(OutwardEntry::getWeightTons)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            long totalInUnits = generalInwards.stream()
                    .map(InwardEntry::getUnitsCount)
                    .filter(Objects::nonNull)
                    .mapToLong(Integer::longValue)
                    .sum();
            long totalOutUnits = generalOutwards.stream()
                    .map(OutwardEntry::getUnitsCount)
                    .filter(Objects::nonNull)
                    .mapToLong(Integer::longValue)
                    .sum();

            OffsetDateTime lastIn = generalInwards.stream()
                    .map(InwardEntry::getMovementTime)
                    .filter(Objects::nonNull)
                    .max(Comparator.naturalOrder())
                    .orElse(null);
            OffsetDateTime lastOut = generalOutwards.stream()
                    .map(OutwardEntry::getMovementTime)
                    .filter(Objects::nonNull)
                    .max(Comparator.naturalOrder())
                    .orElse(null);

            BigDecimal currentStock = totalIn.subtract(totalOut);
            BigDecimal currentWeight = totalInWeight.subtract(totalOutWeight);
            long currentUnits = totalInUnits - totalOutUnits;

            return new MaterialStatsDto(
                    material.getId(),
                    material.getName(),
                    material.getCode(),
                    material.getUnit(),
                    toDouble(totalIn),
                    toDouble(totalOut),
                    toDouble(currentStock),
                    lastIn,
                    lastOut,
                    toDouble(totalInWeight),
                    toDouble(totalOutWeight),
                    toDouble(currentWeight),
                    totalInUnits,
                    totalOutUnits,
                    currentUnits);
        }

        BigDecimal totalIn = Optional.ofNullable(inwardEntryRepository
                        .sumQuantityByProjectAndMaterial(project, material))
                .orElse(BigDecimal.ZERO);
        BigDecimal totalOut = Optional.ofNullable(outwardEntryRepository
                        .sumQuantityByProjectAndMaterial(project, material))
                .orElse(BigDecimal.ZERO);
        BigDecimal currentStock = totalIn.subtract(totalOut);
        BigDecimal totalInWeight = Optional.ofNullable(inwardEntryRepository
                        .sumWeightByProjectAndMaterial(project, material))
                .orElse(BigDecimal.ZERO);
        BigDecimal totalOutWeight = Optional.ofNullable(outwardEntryRepository
                        .sumWeightByProjectAndMaterial(project, material))
                .orElse(BigDecimal.ZERO);
        BigDecimal currentWeight = totalInWeight.subtract(totalOutWeight);
        long totalInUnits = Optional.ofNullable(inwardEntryRepository
                        .sumUnitsByProjectAndMaterial(project, material))
                .orElse(0L);
        long totalOutUnits = Optional.ofNullable(outwardEntryRepository
                        .sumUnitsByProjectAndMaterial(project, material))
                .orElse(0L);
        long currentUnits = totalInUnits - totalOutUnits;
        OffsetDateTime lastIn = inwardEntryRepository
                .findFirstByProjectAndMaterialOrderByMovementTimeDesc(project, material)
                .map(InwardEntry::getMovementTime)
                .orElse(null);
        OffsetDateTime lastOut = outwardEntryRepository
                .findFirstByProjectAndMaterialOrderByMovementTimeDesc(project, material)
                .map(OutwardEntry::getMovementTime)
                .orElse(null);
        MaterialDto materialDto = mapper.toMaterialDto(material);
        return new MaterialStatsDto(
                material.getId(),
                materialDto.name(),
                materialDto.code(),
                materialDto.unit(),
                totalIn.doubleValue(),
                totalOut.doubleValue(),
                currentStock.doubleValue(),
                lastIn,
                lastOut,
                toDouble(totalInWeight),
                toDouble(totalOutWeight),
                toDouble(currentWeight),
                totalInUnits,
                totalOutUnits,
                currentUnits);
    }

    private void validateQuantity(double quantity) {
        if (Double.isNaN(quantity) || Double.isInfinite(quantity) || quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }
    }

    private OffsetDateTime toMovementTime(java.time.LocalDate date) {
        if (date == null) {
            return mapper.now();
        }
        return date.atStartOfDay(java.time.ZoneId.systemDefault()).toOffsetDateTime();
    }

    private MovementDto toInwardMovement(Project project, Material material, InwardEntry entry) {
        BigDecimal remaining = entry.getRemainingQuantity();
        BigDecimal invoiceQuantity = entry.getInvoiceQuantity() != null
                ? entry.getInvoiceQuantity()
                : entry.getQuantity();
        Long projectId = project != null ? project.getId() : null;
        String projectName = project != null ? project.getName() : GENERAL_STORE_LABEL;
        return new MovementDto(
                entry.getId(),
                "IN",
                projectId,
                projectName,
                material.getId(),
                material.getName(),
                entry.getQuantity().doubleValue(),
                entry.getMovementTime(),
                entry.getInvoiceNumber(),
                entry.getInvoiceDate(),
                entry.getReceiveDate(),
                toDouble(invoiceQuantity),
                entry.getVehicleNumber(),
                entry.getSupplier(),
                null,
                null,
                null,
                null,
                toDouble(remaining),
                null,
                entry.getRemarks());
    }

    private MovementDto toOutwardMovement(Project project, Material material, OutwardEntry entry) {
        Long projectId = project != null ? project.getId() : null;
        String projectName = project != null ? project.getName() : GENERAL_STORE_LABEL;
        String batchInfo = entry.getBatchConsumptions().stream()
                .map(consumption -> {
                    InwardEntry inward = consumption.getInwardEntry();
                    String label = inward.getBatchNumber();
                    if (label == null || label.isBlank()) {
                        label = "Batch-" + inward.getId();
                    }
                    double consumed = consumption
                            .getQuantity()
                            .setScale(3, RoundingMode.HALF_UP)
                            .doubleValue();
                    return label + " (" + consumed + ")";
                })
                .collect(Collectors.joining(", "));
        if (batchInfo.isBlank()) {
            batchInfo = null;
        }
        return new MovementDto(
                entry.getId(),
                "OUT",
                projectId,
                projectName,
                material.getId(),
                material.getName(),
                entry.getQuantity().doubleValue(),
                entry.getMovementTime(),
                null,
                null,
                null,
                null,
                null,
                null,
                entry.getHandoverDate(),
                entry.getHandoverName(),
                entry.getHandoverDesignation(),
                entry.getStoreInchargeName(),
                null,
                batchInfo,
                entry.getRemarks());
    }

    private Double toDouble(BigDecimal value) {
        return value != null ? value.doubleValue() : null;
    }
}
