package com.store.demo.service;

import com.store.demo.domain.Material;
import com.store.demo.domain.Project;
import com.store.demo.domain.ProjectMaterial;
import com.store.demo.repository.ProjectMaterialRepository;
import com.store.demo.service.dto.LinkMaterialCommand;
import com.store.demo.web.error.BadRequestException;
import com.store.demo.web.error.ResourceNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProjectMaterialService {

    private final ProjectMaterialRepository projectMaterialRepository;
    private final ProjectService projectService;
    private final MaterialService materialService;
    public ProjectMaterialService(
            ProjectMaterialRepository projectMaterialRepository,
            ProjectService projectService,
            MaterialService materialService) {
        this.projectMaterialRepository = projectMaterialRepository;
        this.projectService = projectService;
        this.materialService = materialService;
    }

    public void linkMaterial(LinkMaterialCommand command) {
        Project project = projectService.getProjectEntity(command.projectId());
        Material material = materialService.getMaterialEntity(command.materialId());
        if (projectMaterialRepository.existsByProjectAndMaterial(project, material)) {
            throw new BadRequestException("Material already linked to project");
        }
        ProjectMaterial projectMaterial = new ProjectMaterial();
        projectMaterial.setProject(project);
        projectMaterial.setMaterial(material);
        projectMaterial.setDefaultLocationOverride(command.defaultLocationOverride());
        projectMaterialRepository.save(projectMaterial);
    }

    public void unlinkMaterial(Long projectId, Long materialId) {
        Project project = projectService.getProjectEntity(projectId);
        Material material = materialService.getMaterialEntity(materialId);
        ProjectMaterial projectMaterial = projectMaterialRepository
                .findByProjectAndMaterial(project, material)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Material not linked with project"));
        projectMaterialRepository.delete(projectMaterial);
    }

    @Transactional(readOnly = true)
    public List<ProjectMaterial> getProjectMaterials(Long projectId) {
        Project project = projectService.getProjectEntity(projectId);
        return projectMaterialRepository.findByProject(project);
    }
}
