package com.store.demo.service.dto;

import java.time.OffsetDateTime;

public record RecordInwardCommand(
        Long projectId,
        Long materialId,
        double quantity,
        Double declaredQuantity,
        String batchNumber,
        Double weightTons,
        Integer unitsCount,
        OffsetDateTime movementTime,
        String vehicleType,
        String vehicleNumber,
        String supplier,
        String reference,
        String remarks) {}
