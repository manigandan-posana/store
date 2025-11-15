package com.store.demo.service.dto;

import java.util.List;

public record ProjectDashboardDto(
        List<ProjectDto> projects,
        long projectCount,
        ProjectDto selectedProject,
        List<MaterialStatsDto> materialSummaries,
        List<MovementDto> recentActivity) {}
