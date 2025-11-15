package com.store.demo.service;

import com.store.demo.domain.Material;
import com.store.demo.repository.MaterialRepository;
import com.store.demo.service.dto.CreateMaterialCommand;
import com.store.demo.service.dto.MaterialDto;
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

    public MaterialService(MaterialRepository materialRepository, DtoMapper mapper) {
        this.materialRepository = materialRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<MaterialDto> findAll() {
        return materialRepository.findAll().stream().map(mapper::toMaterialDto).collect(Collectors.toList());
    }

    public MaterialDto create(CreateMaterialCommand command) {
        if (command.code() == null || command.code().isBlank()) {
            throw new BadRequestException("Material code is required");
        }
        if (command.name() == null || command.name().isBlank()) {
            throw new BadRequestException("Material name is required");
        }
        if (materialRepository.existsByCodeIgnoreCase(command.code())) {
            throw new BadRequestException("Material code already exists");
        }
        OffsetDateTime now = mapper.now();
        Material material = new Material();
        material.setCode(command.code().trim());
        material.setName(command.name().trim());
        material.setUnit(command.unit());
        material.setCategory(command.category());
        material.setMinimumStock(command.minimumStock());
        material.setDefaultLocation(command.defaultLocation());
        material.setCreatedAt(now);
        material.setUpdatedAt(now);
        material = materialRepository.save(material);
        return mapper.toMaterialDto(material);
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
