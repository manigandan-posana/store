package com.store.demo.repository;

import com.store.demo.domain.Project;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    boolean existsByCodeIgnoreCase(String code);

    Optional<Project> findByCodeIgnoreCase(String code);
}
