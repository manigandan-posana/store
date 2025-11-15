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
        ProjectDto generalProject = inventoryService.getGeneralProjectDescriptor();
        List<ProjectDto> projects = new java.util.ArrayList<>();
        projects.add(generalProject);
        projects.addAll(projectService.findAll());

        ProjectDto selectedProject = null;
        if (projectId != null) {
            if (projectId == 0L) {
                selectedProject = generalProject;
            } else {
                selectedProject = projects.stream()
                        .filter(p -> p.id() != null && p.id().equals(projectId))
                        .findFirst()
                        .orElse(null);
            }
        }
        if (selectedProject == null && !projects.isEmpty()) {
            selectedProject = projects.get(0);
        }

        boolean generalSelected = selectedProject != null && Long.valueOf(0L).equals(selectedProject.id());
        List<MaterialStatsDto> materialSummaries = selectedProject != null
                ? (generalSelected
                        ? inventoryService.getGeneralMaterialStats()
                        : inventoryService.getProjectMaterialStats(selectedProject.id()))
                : List.of();
        return new ProjectDashboardDto(
                projects,
                Math.max(0, projects.size() - 1),
                selectedProject,
                materialSummaries,
                inventoryService.getRecentActivity(selectedProject != null ? (generalSelected ? 0L : selectedProject.id()) : null, 12));
    }
}
