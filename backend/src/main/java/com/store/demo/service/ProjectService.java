package com.store.demo.service;

import com.store.demo.domain.Project;
import com.store.demo.repository.ProjectRepository;
import com.store.demo.service.dto.CreateProjectCommand;
import com.store.demo.service.dto.ProjectDto;
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
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final DtoMapper mapper;

    public ProjectService(ProjectRepository projectRepository, DtoMapper mapper) {
        this.projectRepository = projectRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> findAll() {
        return projectRepository.findAll().stream().map(mapper::toProjectDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDto findById(Long id) {
        return mapper.toProjectDto(getProjectEntity(id));
    }

    public ProjectDto create(CreateProjectCommand command) {
        if (command.code() == null || command.code().isBlank()) {
            throw new BadRequestException("Project code is required");
        }
        if (command.name() == null || command.name().isBlank()) {
            throw new BadRequestException("Project name is required");
        }
        if (projectRepository.existsByCodeIgnoreCase(command.code())) {
            throw new BadRequestException("Project code already exists");
        }
        OffsetDateTime now = mapper.now();
        Project project = new Project();
        project.setCode(command.code().trim());
        project.setName(command.name().trim());
        project.setClientLocation(command.clientLocation());
        project.setStatus(command.status() == null ? "In Progress" : command.status());
        project.setDescription(command.description());
        project.setCreatedAt(now);
        project.setUpdatedAt(now);
        project = projectRepository.save(project);
        return mapper.toProjectDto(project);
    }

    public Project getProjectEntity(Long id) {
        return projectRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
    }
}
