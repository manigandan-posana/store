package com.store.demo.service.dto;

import java.time.OffsetDateTime;

public record ProjectDto(
        Long id,
        String code,
        String name,
        String clientLocation,
        String status,
        String description,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {}
