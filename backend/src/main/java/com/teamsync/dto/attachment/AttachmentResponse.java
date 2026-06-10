package com.teamsync.dto.attachment;

import java.time.LocalDateTime;
import java.util.UUID;

public record AttachmentResponse(
        UUID id,
        UUID taskId,
        String name,
        String fileUrl,
        String fileType,
        Long fileSize,
        UUID uploadedById,
        String uploadedByName,
        LocalDateTime createdAt
) {}
