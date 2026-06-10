package com.teamsync.dto.dashboard;

public record TaskStatusCount(
        String status,
        long count
) {}
