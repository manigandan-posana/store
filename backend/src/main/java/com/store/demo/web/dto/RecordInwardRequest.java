package com.store.demo.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record RecordInwardRequest(
        @NotBlank(message = "Invoice number is required") String invoiceNumber,
        @NotNull(message = "Invoice date is required") LocalDate invoiceDate,
        @NotNull(message = "Receiving date is required") LocalDate receiveDate,
        String vehicleNumber,
        @NotNull(message = "Invoice quantity is required") @Positive(message = "Invoice quantity must be positive")
                Double invoiceQuantity,
        @NotNull(message = "Delivered quantity is required")
                @Positive(message = "Delivered quantity must be positive")
                Double deliveredQuantity,
        String supplierName,
        String remarks) {}
