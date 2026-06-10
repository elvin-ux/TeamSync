package com.teamsync.dto.dashboard;

import com.teamsync.dto.task.TaskResponse;
import java.util.List;

public record DashboardStatsResponse(
        long totalUsers,
        long totalProjects,
        long activeProjects,
        double overallTaskCompletionRate,
        long totalPendingTasks,
        long totalOverdueTasks,
        long userAssignedTasksCount,
        long userCompletedTasksCount,
        List<TaskResponse> userUpcomingTasks,
        List<ProjectStatusCount> projectStatusBreakdown,
        List<TaskStatusCount> taskStatusBreakdown,
        List<TeamProductivityDto> teamProductivity
) {}
