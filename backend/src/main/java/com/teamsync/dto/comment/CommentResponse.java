package com.teamsync.dto.comment;

import java.time.LocalDateTime;
import java.util.UUID;

public record CommentResponse(
        UUID id,
        UUID taskId,
        UUID authorId,
        String authorName,
        String authorEmail,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
