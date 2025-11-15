package com.store.demo.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateProjectRequest(
        @NotBlank(message = "Project name is required") String name,
        @NotBlank(message = "Site location is required") String clientLocation) {}
