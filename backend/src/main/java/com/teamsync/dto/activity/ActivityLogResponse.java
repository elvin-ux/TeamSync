package com.teamsync.dto.activity;

import java.time.LocalDateTime;
import java.util.UUID;

public record ActivityLogResponse(
        UUID id,
        UUID projectId,
        UUID userId,
        String userName,
        String action,
        String details,
        LocalDateTime createdAt
) {}
