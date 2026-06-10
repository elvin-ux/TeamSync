package com.teamsync.dto.dashboard;

public record ProjectStatusCount(
        String status,
        long count
) {}
