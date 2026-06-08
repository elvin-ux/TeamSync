package com.teamsync.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @Size(max = 100, message = "Department cannot exceed 100 characters")
        String department,

        @Size(max = 500, message = "Bio cannot exceed 500 characters")
        String bio
) {}
