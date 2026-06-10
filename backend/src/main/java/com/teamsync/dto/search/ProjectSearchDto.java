package com.teamsync.dto.search;

import java.util.UUID;

public record ProjectSearchDto(
        UUID id,
        String name,
        String description
) {}
