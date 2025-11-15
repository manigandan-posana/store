package com.store.demo.web;

import com.store.demo.service.InventoryService;
import com.store.demo.service.ProjectMaterialService;
import com.store.demo.service.ProjectService;
import com.store.demo.service.dto.CreateProjectCommand;
import com.store.demo.service.dto.MaterialDetailDto;
import com.store.demo.service.dto.MaterialStatsDto;
import com.store.demo.service.dto.ProjectDto;
import com.store.demo.web.dto.CreateProjectRequest;
import com.store.demo.web.dto.LinkMaterialRequest;
import com.store.demo.web.dto.ProjectDetailResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectMaterialService projectMaterialService;
    private final InventoryService inventoryService;

    public ProjectController(
            ProjectService projectService,
            ProjectMaterialService projectMaterialService,
            InventoryService inventoryService) {
        this.projectService = projectService;
        this.projectMaterialService = projectMaterialService;
        this.inventoryService = inventoryService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','BACKOFFICE')")
    public List<ProjectDto> listProjects() {
        return projectService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('BACKOFFICE')")
    public ProjectDto createProject(@Valid @RequestBody CreateProjectRequest request) {
        return projectService.create(new CreateProjectCommand(request.name(), request.clientLocation()));
    }

    @GetMapping("/{projectId}")
    @PreAuthorize("hasAnyRole('ADMIN','BACKOFFICE')")
    public ProjectDetailResponse getProject(@PathVariable Long projectId) {
        ProjectDto project = projectService.findById(projectId);
        List<MaterialStatsDto> materials = inventoryService.getProjectMaterialStats(projectId);
        return new ProjectDetailResponse(project, materials);
    }

    @PostMapping("/{projectId}/materials")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('BACKOFFICE')")
    public void linkMaterial(
            @PathVariable Long projectId, @Valid @RequestBody LinkMaterialRequest request) {
        projectMaterialService.linkMaterial(new com.store.demo.service.dto.LinkMaterialCommand(
                projectId, request.materialId()));
    }

    @DeleteMapping("/{projectId}/materials/{materialId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('BACKOFFICE')")
    public void unlinkMaterial(@PathVariable Long projectId, @PathVariable Long materialId) {
        projectMaterialService.unlinkMaterial(projectId, materialId);
    }

    @GetMapping("/{projectId}/materials/{materialId}")
    @PreAuthorize("hasAnyRole('ADMIN','BACKOFFICE')")
    public MaterialDetailDto getMaterialDetail(@PathVariable Long projectId, @PathVariable Long materialId) {
        return inventoryService.getMaterialDetail(projectId, materialId);
    }
}
