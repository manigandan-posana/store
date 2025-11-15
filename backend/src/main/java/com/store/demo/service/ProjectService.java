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
        if (command.name() == null || command.name().isBlank()) {
            throw new BadRequestException("Project name is required");
        }
        OffsetDateTime now = mapper.now();
        Project project = new Project();
        project.setCode(generateProjectCode(command.name()));
        project.setName(command.name().trim());
        project.setClientLocation(command.clientLocation());
        project.setStatus("In Progress");
        project.setCreatedAt(now);
        project.setUpdatedAt(now);
        project = projectRepository.save(project);
        return mapper.toProjectDto(project);
    }

    private String generateProjectCode(String name) {
        String base = name == null ? "PRJ" : name.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
        if (base.isBlank()) {
            base = "PRJ";
        }
        base = base.length() > 12 ? base.substring(0, 12) : base;
        String candidate = base;
        int counter = 1;
        while (projectRepository.existsByCodeIgnoreCase(candidate)) {
            candidate = base + String.format("-%02d", counter++);
        }
        return candidate;
    }

    public Project getProjectEntity(Long id) {
        return projectRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
    }
}
