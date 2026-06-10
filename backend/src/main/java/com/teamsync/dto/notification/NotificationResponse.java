package com.teamsync.dto.notification;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        UUID userId,
        String title,
        String message,
        String type,
        boolean isRead,
        LocalDateTime createdAt
) {}
