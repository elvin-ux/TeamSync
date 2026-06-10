package com.teamsync.service;

import com.teamsync.dto.activity.ActivityLogResponse;
import com.teamsync.entity.ActivityLog;
import com.teamsync.entity.Project;
import com.teamsync.entity.User;
import com.teamsync.exception.ResourceNotFoundException;
import com.teamsync.repository.ActivityLogRepository;
import com.teamsync.repository.ProjectRepository;
import com.teamsync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ActivityLogResponse> getActivitiesByProject(UUID projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found with ID: " + projectId);
        }
        return activityLogRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void logActivity(UUID projectId, String userEmail, String action, String details) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        ActivityLog activityLog = ActivityLog.builder()
                .project(project)
                .user(user)
                .action(action)
                .details(details)
                .build();

        activityLogRepository.save(activityLog);
    }

    @Transactional
    public void logActivity(UUID projectId, UUID userId, String action, String details) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        ActivityLog activityLog = ActivityLog.builder()
                .project(project)
                .user(user)
                .action(action)
                .details(details)
                .build();

        activityLogRepository.save(activityLog);
    }

    private ActivityLogResponse mapToResponse(ActivityLog log) {
        return new ActivityLogResponse(
                log.getId(),
                log.getProject().getId(),
                log.getUser().getId(),
                log.getUser().getName(),
                log.getAction(),
                log.getDetails(),
                log.getCreatedAt()
        );
    }
}
