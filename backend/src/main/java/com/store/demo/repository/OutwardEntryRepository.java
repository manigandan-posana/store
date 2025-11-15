package com.store.demo.repository;

import com.store.demo.domain.Material;
import com.store.demo.domain.OutwardEntry;
import com.store.demo.domain.Project;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OutwardEntryRepository extends JpaRepository<OutwardEntry, Long> {
    List<OutwardEntry> findByProjectAndMaterialOrderByMovementTimeDesc(Project project, Material material);

    List<OutwardEntry> findByProject(Project project);

    @Query("SELECT COALESCE(SUM(o.quantity), 0) FROM OutwardEntry o WHERE o.project = :project AND o.material = :material")
    BigDecimal sumQuantityByProjectAndMaterial(@Param("project") Project project, @Param("material") Material material);

    @Query("SELECT COALESCE(SUM(o.quantity), 0) FROM OutwardEntry o WHERE o.material = :material")
    BigDecimal sumQuantityByMaterial(@Param("material") Material material);

    @Query("SELECT COALESCE(SUM(o.weightTons), 0) FROM OutwardEntry o WHERE o.project = :project AND o.material = :material")
    BigDecimal sumWeightByProjectAndMaterial(@Param("project") Project project, @Param("material") Material material);

    @Query("SELECT COALESCE(SUM(COALESCE(o.unitsCount, 0)), 0) FROM OutwardEntry o WHERE o.project = :project AND o.material = :material")
    Long sumUnitsByProjectAndMaterial(@Param("project") Project project, @Param("material") Material material);

    Optional<OutwardEntry> findFirstByProjectAndMaterialOrderByMovementTimeDesc(Project project, Material material);

    Optional<OutwardEntry> findFirstByProjectOrderByMovementTimeDesc(Project project);

    @Query("SELECT COALESCE(SUM(o.quantity), 0) FROM OutwardEntry o")
    BigDecimal sumAllQuantity();

    @Query("SELECT COALESCE(SUM(o.weightTons), 0) FROM OutwardEntry o")
    BigDecimal sumAllWeight();

    @Query("SELECT COALESCE(SUM(COALESCE(o.unitsCount, 0)), 0) FROM OutwardEntry o")
    Long sumAllUnits();
}
