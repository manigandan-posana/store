package com.store.demo.service.mapper;

import com.store.demo.domain.Material;
import com.store.demo.domain.Project;
import com.store.demo.service.dto.MaterialDto;
import com.store.demo.service.dto.ProjectDto;
import java.time.OffsetDateTime;
import org.springframework.stereotype.Component;

@Component
public class DtoMapper {

    public ProjectDto toProjectDto(Project project) {
        return new ProjectDto(
                project.getId(),
                project.getCode(),
                project.getName(),
                project.getClientLocation(),
                project.getStatus(),
                project.getDescription(),
                project.getCreatedAt(),
                project.getUpdatedAt());
    }

    public MaterialDto toMaterialDto(Material material) {
        return new MaterialDto(
                material.getId(),
                material.getCode(),
                material.getName(),
                material.getUnit(),
                material.getCategory(),
                material.getMinimumStock(),
                material.getDefaultLocation(),
                material.getCreatedAt(),
                material.getUpdatedAt());
    }

    public OffsetDateTime now() {
        return OffsetDateTime.now();
    }
}
