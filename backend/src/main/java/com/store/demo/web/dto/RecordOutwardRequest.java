package com.store.demo.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.OffsetDateTime;

public record RecordOutwardRequest(
        @NotNull @Positive Double quantity,
        @PositiveOrZero Double weightTons,
        @PositiveOrZero Integer unitsCount,
        OffsetDateTime movementTime,
        @NotBlank(message = "Issued to / target location is required") String issuedTo,
        String reference,
        String remarks) {}
