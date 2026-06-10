package com.teamsync.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateCommentRequest(
        @NotBlank(message = "Comment content cannot be empty")
        @Size(max = 1000, message = "Comment must not exceed 1000 characters")
        String content
) {}
