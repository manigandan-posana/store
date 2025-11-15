package com.store.demo.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record RecordOutwardRequest(
        @NotNull @Positive(message = "Quantity must be positive") Double quantity,
        @NotNull(message = "Handover date is required") LocalDate handoverDate,
        @NotBlank(message = "Handover name is required") String handoverName,
        String handoverDesignation,
        @NotBlank(message = "Store incharge name is required") String storeInchargeName,
        String remarks) {}
