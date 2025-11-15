package com.store.demo.service;

import com.store.demo.domain.InwardEntry;
import com.store.demo.domain.Material;
import com.store.demo.repository.InwardEntryRepository;
import com.store.demo.repository.MaterialRepository;
import com.store.demo.repository.OutwardEntryRepository;
import com.store.demo.repository.ProjectMaterialRepository;
import com.store.demo.service.dto.CreateMaterialCommand;
import com.store.demo.service.dto.MaterialDto;
import com.store.demo.service.dto.MaterialSummaryDto;
import com.store.demo.service.dto.UpdateMaterialCommand;
import com.store.demo.service.mapper.DtoMapper;
import com.store.demo.web.error.BadRequestException;
import com.store.demo.web.error.ResourceNotFoundException;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final ProjectMaterialRepository projectMaterialRepository;
    private final InwardEntryRepository inwardEntryRepository;
    private final OutwardEntryRepository outwardEntryRepository;
    private final DtoMapper mapper;

    public MaterialService(
            MaterialRepository materialRepository,
            ProjectMaterialRepository projectMaterialRepository,
            InwardEntryRepository inwardEntryRepository,
            OutwardEntryRepository outwardEntryRepository,
            DtoMapper mapper) {
        this.materialRepository = materialRepository;
        this.projectMaterialRepository = projectMaterialRepository;
        this.inwardEntryRepository = inwardEntryRepository;
        this.outwardEntryRepository = outwardEntryRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<MaterialDto> findAll() {
        return materialRepository.findAll().stream().map(mapper::toMaterialDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MaterialSummaryDto> findAllWithStock() {
        return materialRepository.findAll().stream().map(this::toSummary).collect(Collectors.toList());
    }

    public MaterialSummaryDto create(CreateMaterialCommand command) {
        validateMaterialInput(command.name(), command.code());
        if (materialRepository.existsByCodeIgnoreCase(command.code())) {
            throw new BadRequestException("Material drawing number already exists");
        }
        OffsetDateTime now = mapper.now();
        Material material = new Material();
        material.setCode(command.code().trim());
        material.setName(command.name().trim());
        material.setUnit(normalizeOptional(command.unit()));
        material.setCategory(normalizeOptional(command.category()));
        material.setCreatedAt(now);
        material.setUpdatedAt(now);
        material = materialRepository.save(material);

        Double initialQuantity = command.initialQuantity();
        if (initialQuantity != null && initialQuantity > 0) {
            createInitialStockEntry(material, initialQuantity, now);
        }

        return toSummary(material);
    }

    private void createInitialStockEntry(Material material, double quantity, OffsetDateTime now) {
        InwardEntry entry = new InwardEntry();
        entry.setMaterial(material);
        BigDecimal qty = BigDecimal.valueOf(quantity).setScale(3, RoundingMode.HALF_UP);
        entry.setQuantity(qty);
        entry.setRemainingQuantity(qty);
        entry.setInvoiceQuantity(qty);
        entry.setMovementTime(now);
        entry.setReceiveDate(now.toLocalDate());
        entry.setInvoiceDate(now.toLocalDate());
        entry.setInvoiceNumber("INIT-" + material.getCode());
        entry.setSupplier("Opening Balance");
        entry.setReference("Initial Stock");
        entry.setCreatedAt(now);
        inwardEntryRepository.save(entry);
    }

    public MaterialSummaryDto update(Long materialId, UpdateMaterialCommand command) {
        validateMaterialInput(command.name(), command.code());
        Material material = getMaterialEntity(materialId);
        if (materialRepository.existsByCodeIgnoreCaseAndIdNot(command.code(), materialId)) {
            throw new BadRequestException("Material drawing number already exists");
        }
        material.setCode(command.code().trim());
        material.setName(command.name().trim());
        material.setUnit(normalizeOptional(command.unit()));
        material.setCategory(normalizeOptional(command.category()));
        material.setUpdatedAt(mapper.now());
        material = materialRepository.save(material);
        return toSummary(material);
    }

    public void delete(Long materialId) {
        Material material = getMaterialEntity(materialId);
        if (projectMaterialRepository.existsByMaterial(material)) {
            throw new BadRequestException("Material is linked to one or more projects");
        }
        materialRepository.delete(material);
    }

    private void validateMaterialInput(String name, String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new BadRequestException("Drawing part number is required");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new BadRequestException("Material name is required");
        }
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    @Transactional(readOnly = true)
    public MaterialDto findById(Long id) {
        return mapper.toMaterialDto(getMaterialEntity(id));
    }

    public Material getMaterialEntity(Long id) {
        return materialRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found: " + id));
    }

    private MaterialSummaryDto toSummary(Material material) {
        BigDecimal totalIn = Optional.ofNullable(inwardEntryRepository.sumQuantityByMaterial(material))
                .orElse(BigDecimal.ZERO);
        BigDecimal totalOut = Optional.ofNullable(outwardEntryRepository.sumQuantityByMaterial(material))
                .orElse(BigDecimal.ZERO);
        double onHand = totalIn.subtract(totalOut).doubleValue();
        return new MaterialSummaryDto(
                material.getId(),
                material.getCode(),
                material.getName(),
                material.getUnit(),
                material.getCategory(),
                material.getCreatedAt(),
                material.getUpdatedAt(),
                onHand);
    }
}
