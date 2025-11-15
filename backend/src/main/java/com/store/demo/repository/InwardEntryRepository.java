package com.store.demo.repository;

import com.store.demo.domain.InwardEntry;
import com.store.demo.domain.Material;
import com.store.demo.domain.Project;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InwardEntryRepository extends JpaRepository<InwardEntry, Long> {
    List<InwardEntry> findByProjectAndMaterialOrderByMovementTimeAsc(Project project, Material material);

    List<InwardEntry> findByProject(Project project);

    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM InwardEntry i WHERE i.project = :project AND i.material = :material")
    BigDecimal sumQuantityByProjectAndMaterial(@Param("project") Project project, @Param("material") Material material);

    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM InwardEntry i WHERE i.material = :material")
    BigDecimal sumQuantityByMaterial(@Param("material") Material material);

    @Query("SELECT COALESCE(SUM(i.remainingQuantity), 0) FROM InwardEntry i WHERE i.material = :material")
    BigDecimal sumRemainingByMaterial(@Param("material") Material material);

    @Query("SELECT COALESCE(SUM(i.remainingQuantity), 0) FROM InwardEntry i WHERE i.project = :project AND i.material = :material")
    BigDecimal sumRemainingByProjectAndMaterial(@Param("project") Project project, @Param("material") Material material);

    @Query("SELECT COALESCE(SUM(i.weightTons), 0) FROM InwardEntry i WHERE i.project = :project AND i.material = :material")
    BigDecimal sumWeightByProjectAndMaterial(@Param("project") Project project, @Param("material") Material material);

    @Query("SELECT COALESCE(SUM(COALESCE(i.unitsCount, 0)), 0) FROM InwardEntry i WHERE i.project = :project AND i.material = :material")
    Long sumUnitsByProjectAndMaterial(@Param("project") Project project, @Param("material") Material material);

    Optional<InwardEntry> findFirstByProjectAndMaterialOrderByMovementTimeDesc(Project project, Material material);

    Optional<InwardEntry> findFirstByProjectOrderByMovementTimeDesc(Project project);

    @Query("SELECT COALESCE(SUM(i.quantity), 0) FROM InwardEntry i")
    BigDecimal sumAllQuantity();

    @Query("SELECT COALESCE(SUM(i.weightTons), 0) FROM InwardEntry i")
    BigDecimal sumAllWeight();

    @Query("SELECT COALESCE(SUM(COALESCE(i.unitsCount, 0)), 0) FROM InwardEntry i")
    Long sumAllUnits();

    @Query("SELECT COALESCE(SUM(i.remainingQuantity), 0) FROM InwardEntry i")
    BigDecimal sumAllRemainingQuantity();
}
