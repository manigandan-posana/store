package com.store.demo.service.dto;

import java.time.LocalDate;

public record RecordInwardCommand(
        Long projectId,
        Long materialId,
        double deliveredQuantity,
        double invoiceQuantity,
        String invoiceNumber,
        LocalDate invoiceDate,
        LocalDate receiveDate,
        String vehicleNumber,
        String supplierName,
        String remarks) {}
