package com.store.demo.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.store.demo.service.dto.CreateMaterialCommand;
import com.store.demo.service.dto.CreateProjectCommand;
import com.store.demo.service.dto.LinkMaterialCommand;
import com.store.demo.service.dto.MaterialDetailDto;
import com.store.demo.service.dto.MaterialSummaryDto;
import com.store.demo.service.dto.ProjectDto;
import com.store.demo.service.dto.RecordInwardCommand;
import com.store.demo.service.dto.RecordOutwardCommand;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class InventoryServiceTest {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private MaterialService materialService;

    @Autowired
    private ProjectMaterialService projectMaterialService;

    @Autowired
    private InventoryService inventoryService;

    @Test
    void fifoOutwardConsumesOldestBatchesFirst() {
        ProjectDto project = projectService.create(new CreateProjectCommand("Project A", "Chennai"));
        MaterialSummaryDto material =
                materialService.create(new CreateMaterialCommand("Steel Rod", "ST-001", "kg", "Metals"));
        projectMaterialService.linkMaterial(new LinkMaterialCommand(project.id(), material.id()));

        LocalDate today = LocalDate.now();
        inventoryService.recordInward(new RecordInwardCommand(
                project.id(),
                material.id(),
                100,
                100,
                "INV-1",
                today.minusDays(1),
                today.minusDays(1),
                "TN01",
                "Supplier A",
                null));
        inventoryService.recordInward(new RecordInwardCommand(
                project.id(),
                material.id(),
                50,
                50,
                "INV-2",
                today,
                today,
                "TN02",
                "Supplier A",
                null));

        inventoryService.recordOutward(new RecordOutwardCommand(
                project.id(),
                material.id(),
                120,
                today,
                "Site Supervisor",
                "Engineer",
                "Incharge",
                null));

        MaterialDetailDto detail = inventoryService.getMaterialDetail(project.id(), material.id());
        assertThat(detail.stats().totalIn()).isEqualTo(150.0);
        assertThat(detail.stats().totalOut()).isEqualTo(120.0);
        assertThat(detail.stats().currentStock()).isEqualTo(30.0);
        assertThat(detail.history()).hasSize(3);
        assertThat(detail.history().get(0).type()).isEqualTo("OUT");
    }
}
