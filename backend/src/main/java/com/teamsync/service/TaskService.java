package com.teamsync.service;

import com.teamsync.dto.task.CreateTaskRequest;
import com.teamsync.dto.task.TaskResponse;
import com.teamsync.dto.task.UpdateTaskRequest;
import com.teamsync.entity.*;
import com.teamsync.exception.ResourceNotFoundException;
import com.teamsync.repository.ProjectRepository;
import com.teamsync.repository.TaskRepository;
import com.teamsync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByProject(UUID projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found with ID: " + projectId);
        }
        return taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));
        return mapToResponse(task);
    }

    @Transactional
    public TaskResponse createTask(CreateTaskRequest request, String userEmail) {
        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + request.projectId()));

        User assignee = null;
        if (request.assignedToId() != null) {
            assignee = userRepository.findById(request.assignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found with ID: " + request.assignedToId()));
        }

        TaskStatus status = parseStatus(request.status());
        TaskPriority priority = parsePriority(request.priority());

        Task task = Task.builder()
                .project(project)
                .assignedTo(assignee)
                .createdBy(creator)
                .title(request.title())
                .description(request.description())
                .status(status)
                .priority(priority)
                .deadline(request.deadline())
                .estimatedHours(request.estimatedHours())
                .build();

        Task saved = taskRepository.save(task);

        activityLogService.logActivity(project.getId(), userEmail, "TASK_CREATED", saved.getTitle());
        if (assignee != null) {
            activityLogService.logActivity(project.getId(), userEmail, "TASK_ASSIGNED", saved.getTitle() + " to " + assignee.getName());
        }

        return mapToResponse(saved);
    }

    @Transactional
    public TaskResponse updateTask(UUID taskId, UpdateTaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        User assignee = null;
        if (request.assignedToId() != null) {
            assignee = userRepository.findById(request.assignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found with ID: " + request.assignedToId()));
        }

        boolean isCompletedTransition = !TaskStatus.COMPLETED.equals(task.getStatus()) && TaskStatus.COMPLETED.equals(parseStatus(request.status()));
        boolean assigneeChanged = (task.getAssignedTo() == null && assignee != null) ||
                                  (task.getAssignedTo() != null && (assignee == null || !task.getAssignedTo().getId().equals(assignee.getId())));

        task.setAssignedTo(assignee);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(parseStatus(request.status()));
        task.setPriority(parsePriority(request.priority()));
        task.setDeadline(request.deadline());
        task.setEstimatedHours(request.estimatedHours());
        task.setActualHours(request.actualHours());

        Task updated = taskRepository.save(task);

        String currentEmail = "system@teamsync.com";
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            currentEmail = auth.getName();
        }

        if (isCompletedTransition) {
            activityLogService.logActivity(updated.getProject().getId(), currentEmail, "TASK_COMPLETED", updated.getTitle());
        }
        if (assigneeChanged && assignee != null) {
            activityLogService.logActivity(updated.getProject().getId(), currentEmail, "TASK_ASSIGNED", updated.getTitle() + " to " + assignee.getName());
        }

        return mapToResponse(updated);
    }

    @Transactional
    public void deleteTask(UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));
        taskRepository.delete(task);
    }

    @Transactional
    public TaskResponse updateTaskStatus(UUID taskId, TaskStatus status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));
        
        boolean isCompletedTransition = !TaskStatus.COMPLETED.equals(task.getStatus()) && TaskStatus.COMPLETED.equals(status);
        task.setStatus(status);
        Task updated = taskRepository.save(task);

        if (isCompletedTransition) {
            String currentEmail = "system@teamsync.com";
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                currentEmail = auth.getName();
            }
            activityLogService.logActivity(updated.getProject().getId(), currentEmail, "TASK_COMPLETED", updated.getTitle());
        }

        return mapToResponse(updated);
    }

    @Transactional
    public TaskResponse assignTask(UUID taskId, UUID userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        User assignee = null;
        if (userId != null) {
            assignee = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        }

        boolean assigneeChanged = (task.getAssignedTo() == null && assignee != null) ||
                                  (task.getAssignedTo() != null && (assignee == null || !task.getAssignedTo().getId().equals(assignee.getId())));
        task.setAssignedTo(assignee);
        Task updated = taskRepository.save(task);

        if (assigneeChanged && assignee != null) {
            String currentEmail = "system@teamsync.com";
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                currentEmail = auth.getName();
            }
            activityLogService.logActivity(updated.getProject().getId(), currentEmail, "TASK_ASSIGNED", updated.getTitle() + " to " + assignee.getName());
        }

        return mapToResponse(updated);
    }

    private TaskResponse mapToResponse(Task task) {
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

    private TaskStatus parseStatus(String statusStr) {
        if (statusStr == null) {
            return TaskStatus.TODO;
        }
        try {
            return TaskStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return TaskStatus.TODO;
        }
    }

    private TaskPriority parsePriority(String priorityStr) {
        if (priorityStr == null) {
            return TaskPriority.MEDIUM;
        }
        try {
            return TaskPriority.valueOf(priorityStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return TaskPriority.MEDIUM;
        }
    }
}
