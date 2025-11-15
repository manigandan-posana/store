package com.store.demo.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record CreateMaterialRequest(
        @NotBlank(message = "Material name is required") String name,
        @NotBlank(message = "Drawing part number is required") String code,
        String unit,
        String category,
        @PositiveOrZero(message = "In-hand quantity cannot be negative") Double initialQuantity) {}
