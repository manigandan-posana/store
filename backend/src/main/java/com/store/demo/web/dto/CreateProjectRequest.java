package com.store.demo.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateProjectRequest(
        @NotBlank(message = "Project name is required") String name,
        @NotBlank(message = "Project code is required") String code,
        String clientLocation,
        String status,
        String description) {}
