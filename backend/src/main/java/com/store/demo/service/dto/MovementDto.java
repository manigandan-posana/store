package com.store.demo.service.dto;

import java.time.OffsetDateTime;

public record MovementDto(
        Long id,
        String type,
        Long projectId,
        String projectName,
        Long materialId,
        String materialName,
        double quantity,
        OffsetDateTime movementTime,
        String vehicleType,
        String vehicleNumber,
        String issuedToOrSupplier,
        String batchNumber,
        Double declaredQuantity,
        Double variance,
        Double weightTons,
        Integer unitsCount,
        Double remainingQuantity,
        String reference,
        String remarks) {}
