package com.teamsync.service;

import com.teamsync.dto.dashboard.*;
import com.teamsync.dto.task.TaskResponse;
import com.teamsync.entity.*;
import com.teamsync.exception.ResourceNotFoundException;
import com.teamsync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats(String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        // 1. Overview counts
        long totalUsers = userRepository.count();
        long totalProjects = projectRepository.count();
        
        long activeProjects = projectRepository.findAll().stream()
                .filter(p -> ProjectStatus.ACTIVE.equals(p.getStatus()))
                .count();

        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.countByStatus(TaskStatus.COMPLETED);
        double overallTaskCompletionRate = totalTasks == 0 ? 0.0 : ((double) completedTasks / totalTasks) * 100;

        long totalPendingTasks = totalTasks - completedTasks;

        long totalOverdueTasks = taskRepository.findAll().stream()
                .filter(t -> t.getDeadline() != null && t.getDeadline().isBefore(LocalDate.now()) && !TaskStatus.COMPLETED.equals(t.getStatus()))
                .count();

        // 2. Member stats (specific to the logged-in user)
        List<Task> userTasks = taskRepository.findByAssignedToIdOrderByCreatedAtDesc(currentUser.getId());
        long userAssignedTasksCount = userTasks.size();
        long userCompletedTasksCount = userTasks.stream()
                .filter(t -> TaskStatus.COMPLETED.equals(t.getStatus()))
                .count();

        List<TaskResponse> userUpcomingTasks = userTasks.stream()
                .filter(t -> t.getDeadline() != null && !TaskStatus.COMPLETED.equals(t.getStatus()))
                .sorted(Comparator.comparing(Task::getDeadline))
                .limit(5)
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());

        // 3. Project status breakdown
        Map<ProjectStatus, Long> projCounts = projectRepository.findAll().stream()
                .collect(Collectors.groupingBy(Project::getStatus, Collectors.counting()));
        List<ProjectStatusCount> projectStatusBreakdown = Arrays.stream(ProjectStatus.values())
                .map(status -> new ProjectStatusCount(status.name(), projCounts.getOrDefault(status, 0L)))
                .collect(Collectors.toList());

        // 4. Task status breakdown
        Map<TaskStatus, Long> taskCounts = taskRepository.findAll().stream()
                .collect(Collectors.groupingBy(Task::getStatus, Collectors.counting()));
        List<TaskStatusCount> taskStatusBreakdown = Arrays.stream(TaskStatus.values())
                .map(status -> new TaskStatusCount(status.name(), taskCounts.getOrDefault(status, 0L)))
                .collect(Collectors.toList());

        // 5. Team productivity (only for active users with tasks)
        List<TeamProductivityDto> teamProductivity = userRepository.findAll().stream()
                .map(u -> {
                    long completed = taskRepository.countByAssignedToIdAndStatus(u.getId(), TaskStatus.COMPLETED);
                    long pending = taskRepository.countByAssignedToIdAndStatusNot(u.getId(), TaskStatus.COMPLETED);
                    return new TeamProductivityDto(u.getName(), completed, pending);
                })
                .filter(dto -> dto.completedTasks() > 0 || dto.pendingTasks() > 0)
                .collect(Collectors.toList());

        return new DashboardStatsResponse(
                totalUsers,
                totalProjects,
                activeProjects,
                overallTaskCompletionRate,
                totalPendingTasks,
                totalOverdueTasks,
                userAssignedTasksCount,
                userCompletedTasksCount,
                userUpcomingTasks,
                projectStatusBreakdown,
                taskStatusBreakdown,
                teamProductivity
        );
    }

    private TaskResponse mapToTaskResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getProject().getId(),
                task.getProject().getName(),
                task.getAssignedTo() != null ? task.getAssignedTo().getId() : null,
                task.getAssignedTo() != null ? task.getAssignedTo().getName() : null,
                task.getCreatedBy().getId(),
                task.getCreatedBy().getName(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus().name(),
                task.getPriority().name(),
                task.getDeadline(),
                task.getEstimatedHours(),
                task.getActualHours(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
