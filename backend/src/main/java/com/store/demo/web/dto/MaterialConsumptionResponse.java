package com.store.demo.web.dto;

public record MaterialConsumptionResponse(
        Long materialId,
        String materialName,
        double quantityConsumed,
        Double weightConsumed,
        Long unitsConsumed) {}
