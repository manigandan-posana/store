package com.store.demo.web;

import com.store.demo.service.InventoryService;
import com.store.demo.service.dto.MovementDto;
import com.store.demo.service.dto.RecordInwardCommand;
import com.store.demo.service.dto.RecordOutwardCommand;
import com.store.demo.web.dto.RecordInwardRequest;
import com.store.demo.web.dto.RecordOutwardRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects/{projectId}/materials/{materialId}")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/inwards")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('BACKOFFICE')")
    public MovementDto recordInward(
            @PathVariable Long projectId,
            @PathVariable Long materialId,
            @Valid @RequestBody RecordInwardRequest request) {
        return inventoryService.recordInward(new RecordInwardCommand(
                projectId,
                materialId,
                request.deliveredQuantity(),
                request.invoiceQuantity(),
                request.invoiceNumber(),
                request.invoiceDate(),
                request.receiveDate(),
                request.vehicleNumber(),
                request.supplierName(),
                request.remarks()));
    }

    @PostMapping("/outwards")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('BACKOFFICE')")
    public MovementDto recordOutward(
            @PathVariable Long projectId,
            @PathVariable Long materialId,
            @Valid @RequestBody RecordOutwardRequest request) {
        return inventoryService.recordOutward(new RecordOutwardCommand(
                projectId,
                materialId,
                request.quantity(),
                request.handoverDate(),
                request.handoverName(),
                request.handoverDesignation(),
                request.storeInchargeName(),
                request.remarks()));
    }
}
