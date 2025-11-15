package com.store.demo.web.dto;

import java.util.List;

public record InventoryAnalyticsResponse(
        long totalProjects,
        long totalMaterials,
        double totalQuantityIn,
        double totalQuantityOut,
        double totalQuantityOnHand,
        Double totalTonsIn,
        Double totalTonsOut,
        Double totalTonsOnHand,
        Long totalUnitsIn,
        Long totalUnitsOut,
        Long totalUnitsOnHand,
        List<ProjectConsumptionResponse> projectConsumption) {}
