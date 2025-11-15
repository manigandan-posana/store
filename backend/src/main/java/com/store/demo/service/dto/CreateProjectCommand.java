package com.store.demo.service.dto;

public record CreateProjectCommand(
        String name,
        String code,
        String clientLocation,
        String status,
        String description) {}
