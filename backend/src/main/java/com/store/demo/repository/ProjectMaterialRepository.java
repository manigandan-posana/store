package com.store.demo.repository;

import com.store.demo.domain.Material;
import com.store.demo.domain.Project;
import com.store.demo.domain.ProjectMaterial;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectMaterialRepository extends JpaRepository<ProjectMaterial, Long> {
    boolean existsByProjectAndMaterial(Project project, Material material);

    List<ProjectMaterial> findByProject(Project project);

    Optional<ProjectMaterial> findByProjectAndMaterial(Project project, Material material);

    boolean existsByMaterial(Material material);
}
