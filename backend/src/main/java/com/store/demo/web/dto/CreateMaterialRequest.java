package com.store.demo.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateMaterialRequest(
        @NotBlank(message = "Material name is required") String name,
        @NotBlank(message = "Material code is required") String code,
        String unit,
        String category,
        Integer minimumStock,
        String defaultLocation) {}
