package com.teamsync.dto.dashboard;

public record TeamProductivityDto(
        String memberName,
        long completedTasks,
        long pendingTasks
) {}
