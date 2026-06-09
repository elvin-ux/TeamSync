package com.teamsync.dto.project;

import java.time.LocalDateTime;
import java.util.UUID;

public record ProjectMemberResponse(
        UUID membershipId,
        UUID userId,
        String name,
        String email,
        String role,
        String avatarUrl,
        String department,
        String roleInProject,
        LocalDateTime joinedAt
) {}
