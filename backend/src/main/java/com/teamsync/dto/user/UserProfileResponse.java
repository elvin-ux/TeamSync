package com.teamsync.dto.user;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String name,
        String email,
        String role,
        String avatarUrl,
        String department,
        String bio,
        LocalDateTime createdAt
) {}
