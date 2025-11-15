package com.store.demo.web.dto;

import jakarta.validation.constraints.NotNull;

public record LinkMaterialRequest(@NotNull Long materialId, String defaultLocationOverride) {}
