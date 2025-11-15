package com.store.demo.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.OffsetDateTime;

public record RecordInwardRequest(
        @NotNull @Positive Double quantity,
        @Positive Double declaredQuantity,
        String batchNumber,
        @PositiveOrZero Double weightTons,
        @PositiveOrZero Integer unitsCount,
        OffsetDateTime movementTime,
        String vehicleType,
        String vehicleNumber,
        String supplier,
        String reference,
        String remarks) {}
