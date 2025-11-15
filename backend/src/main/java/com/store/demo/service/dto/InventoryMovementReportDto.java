package com.store.demo.service.dto;

import java.util.List;

public record InventoryMovementReportDto(
        List<ProjectDto> projects,
        ProjectDto selectedProject,
        List<MovementDto> movements,
        double totalInQuantity,
        double totalOutQuantity) {}
