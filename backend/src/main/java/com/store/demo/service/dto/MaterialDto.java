package com.store.demo.service.dto;

import java.time.OffsetDateTime;

public record MaterialDto(
        Long id,
        String code,
        String name,
        String unit,
        String category,
        Integer minimumStock,
        String defaultLocation,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {}
