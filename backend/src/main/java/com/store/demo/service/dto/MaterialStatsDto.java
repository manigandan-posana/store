package com.store.demo.service.dto;

import java.time.OffsetDateTime;

public record MaterialStatsDto(
        Long materialId,
        String materialName,
        String materialCode,
        String unit,
        double totalIn,
        double totalOut,
        double currentStock,
        OffsetDateTime lastInTime,
        OffsetDateTime lastOutTime,
        Double totalInTons,
        Double totalOutTons,
        Double currentStockTons,
        Long totalInUnits,
        Long totalOutUnits,
        Long currentUnits) {}
