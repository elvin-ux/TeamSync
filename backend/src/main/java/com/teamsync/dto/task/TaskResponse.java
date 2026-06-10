package com.teamsync.dto.task;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        UUID projectId,
        String projectName,
        UUID assignedToId,
        String assignedToName,
        UUID createdById,
        String createdByName,
        String title,
        String description,
        String status,
        String priority,
        LocalDate deadline,
        Double estimatedHours,
        Double actualHours,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
