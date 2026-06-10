package com.teamsync.dto.search;

import java.util.UUID;

public record MemberSearchDto(
        UUID id,
        String name,
        String email,
        String avatarUrl
) {}
