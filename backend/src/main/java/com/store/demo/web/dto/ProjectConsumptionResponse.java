package com.store.demo.web.dto;

import java.util.List;

public record ProjectConsumptionResponse(
        Long projectId,
        String projectName,
        List<MaterialConsumptionResponse> materials) {}
