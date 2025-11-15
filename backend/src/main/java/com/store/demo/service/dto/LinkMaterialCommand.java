package com.store.demo.service.dto;

public record LinkMaterialCommand(Long projectId, Long materialId, String defaultLocationOverride) {}
