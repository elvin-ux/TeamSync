package com.teamsync.dto.search;

import java.util.UUID;

public record CommentSearchDto(
        UUID id,
        String content,
        UUID taskId,
        String taskTitle,
        UUID projectId,
        String authorName
) {}
