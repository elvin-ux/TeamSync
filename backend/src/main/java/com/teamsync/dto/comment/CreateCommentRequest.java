package com.teamsync.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record CreateCommentRequest(
        @NotNull(message = "Task ID is required")
        UUID taskId,

        @NotBlank(message = "Comment content cannot be empty")
        @Size(max = 1000, message = "Comment must not exceed 1000 characters")
        String content
) {}
