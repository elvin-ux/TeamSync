package com.teamsync.dto.search;

import java.util.UUID;

public record TaskSearchDto(
        UUID id,
        String title,
        UUID projectId,
        String projectName,
        String status
) {}
