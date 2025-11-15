package com.store.demo.service.dto;

import java.time.LocalDate;
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
        String invoiceNumber,
        LocalDate invoiceDate,
        LocalDate receiveDate,
        Double invoiceQuantity,
        String vehicleNumber,
        String supplierName,
        LocalDate handoverDate,
        String handoverName,
        String handoverDesignation,
        String storeInchargeName,
        Double remainingQuantity,
        String batchSummary,
        String remarks) {}
