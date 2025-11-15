package com.store.demo.service;

import com.store.demo.service.dto.MaterialStatsDto;
import com.store.demo.service.dto.ProjectDashboardDto;
import com.store.demo.service.dto.ProjectDto;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ProjectService projectService;
    private final InventoryService inventoryService;

    public DashboardService(ProjectService projectService, InventoryService inventoryService) {
        this.projectService = projectService;
        this.inventoryService = inventoryService;
    }

    public ProjectDashboardDto getDashboard(Long projectId) {
        List<ProjectDto> projects = projectService.findAll();
        ProjectDto selectedProject = null;
        if (projectId != null) {
            selectedProject = projects.stream()
                    .filter(p -> p.id().equals(projectId))
                    .findFirst()
                    .orElse(null);
        }
        if (selectedProject == null && !projects.isEmpty()) {
            selectedProject = projects.get(0);
        }

        List<MaterialStatsDto> materialSummaries = selectedProject != null
                ? inventoryService.getProjectMaterialStats(selectedProject.id())
                : List.of();
        return new ProjectDashboardDto(
                projects,
                projects.size(),
                selectedProject,
                materialSummaries,
                inventoryService.getRecentActivity(selectedProject != null ? selectedProject.id() : null, 12));
    }
}
