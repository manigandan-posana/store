package com.store.demo.service.dto;

import java.time.OffsetDateTime;

public record RecordOutwardCommand(
        Long projectId,
        Long materialId,
        double quantity,
        Double weightTons,
        Integer unitsCount,
        OffsetDateTime movementTime,
        String issuedTo,
        String reference,
        String remarks) {}
