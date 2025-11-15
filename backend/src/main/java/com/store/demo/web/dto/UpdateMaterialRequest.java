package com.store.demo.web.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateMaterialRequest(
        @NotBlank(message = "Material name is required") String name,
        @NotBlank(message = "Drawing part number is required") String code,
        String unit,
        String category) {}
