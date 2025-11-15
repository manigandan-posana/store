package com.store.demo.service.dto;

public record CreateMaterialCommand(
        String name,
        String code,
        String unit,
        String category,
        Double initialQuantity) {}
