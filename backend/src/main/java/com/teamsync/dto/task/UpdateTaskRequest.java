package com.teamsync.dto.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record UpdateTaskRequest(
        UUID assignedToId,

        @NotBlank(message = "Task title is required")
        @Size(max = 150, message = "Task title must not exceed 150 characters")
        String title,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description,

        String status,

        String priority,

        LocalDate deadline,

        Double estimatedHours,

        Double actualHours
) {}
