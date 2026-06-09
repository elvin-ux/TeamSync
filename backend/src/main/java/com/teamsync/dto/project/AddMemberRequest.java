package com.teamsync.dto.project;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AddMemberRequest(
        @NotNull(message = "User ID is required")
        UUID userId,

        String roleInProject
) {}
