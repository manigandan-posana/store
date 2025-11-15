package com.store.demo.service;

import com.store.demo.domain.Material;
import com.store.demo.repository.MaterialRepository;
import com.store.demo.repository.ProjectMaterialRepository;
import com.store.demo.service.dto.CreateMaterialCommand;
import com.store.demo.service.dto.MaterialDto;
import com.store.demo.service.dto.UpdateMaterialCommand;
import com.store.demo.service.mapper.DtoMapper;
import com.store.demo.web.error.BadRequestException;
import com.store.demo.web.error.ResourceNotFoundException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final DtoMapper mapper;
    private final ProjectMaterialRepository projectMaterialRepository;

    public MaterialService(MaterialRepository materialRepository, ProjectMaterialRepository projectMaterialRepository, DtoMapper mapper) {
        this.materialRepository = materialRepository;
        this.projectMaterialRepository = projectMaterialRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<MaterialDto> findAll() {
        return materialRepository.findAll().stream().map(mapper::toMaterialDto).collect(Collectors.toList());
    }

    public MaterialDto create(CreateMaterialCommand command) {
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
        return mapper.toMaterialDto(material);
    }

    public MaterialDto update(Long materialId, UpdateMaterialCommand command) {
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
        return mapper.toMaterialDto(material);
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
}
