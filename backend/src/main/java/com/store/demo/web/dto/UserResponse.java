package com.store.demo.web.dto;

import com.store.demo.domain.UserRole;
import java.time.OffsetDateTime;

public record UserResponse(
        Long id,
        String email,
        String displayName,
        UserRole role,
        boolean active,
        OffsetDateTime lastLoginAt,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {}
