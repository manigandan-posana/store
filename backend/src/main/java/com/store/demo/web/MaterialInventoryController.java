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
@RequestMapping("/api/materials/{materialId}/inventory")
@PreAuthorize("hasRole('BACKOFFICE')")
public class MaterialInventoryController {

    private final InventoryService inventoryService;

    public MaterialInventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/inwards")
    @ResponseStatus(HttpStatus.CREATED)
    public MovementDto recordStandaloneInward(
            @PathVariable Long materialId, @Valid @RequestBody RecordInwardRequest request) {
        return inventoryService.recordInward(new RecordInwardCommand(
                null,
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
    public MovementDto recordStandaloneOutward(
            @PathVariable Long materialId, @Valid @RequestBody RecordOutwardRequest request) {
        return inventoryService.recordOutward(new RecordOutwardCommand(
                null,
                materialId,
                request.quantity(),
                request.handoverDate(),
                request.handoverName(),
                request.handoverDesignation(),
                request.storeInchargeName(),
                request.remarks()));
    }
}
