package com.teamsync.service;

import com.teamsync.dto.project.CreateProjectRequest;
import com.teamsync.dto.project.ProjectResponse;
import com.teamsync.dto.project.UpdateProjectRequest;
import com.teamsync.dto.project.AddMemberRequest;
import com.teamsync.dto.project.ProjectMemberResponse;
import com.teamsync.entity.Project;
import com.teamsync.entity.ProjectMember;
import com.teamsync.entity.ProjectPriority;
import com.teamsync.entity.ProjectStatus;
import com.teamsync.entity.User;
import com.teamsync.exception.ResourceNotFoundException;
import com.teamsync.repository.ProjectRepository;
import com.teamsync.repository.UserRepository;
import com.teamsync.repository.ProjectMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjects() {
        return projectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));
        return mapToResponse(project);
    }

    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request, String userEmail) {
        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        ProjectStatus status = parseStatus(request.status());
        ProjectPriority priority = parsePriority(request.priority());

        Project project = Project.builder()
                .name(request.name())
                .description(request.description())
                .status(status)
                .priority(priority)
                .createdBy(creator)
                .startDate(request.startDate())
                .endDate(request.endDate())
                .build();

        Project savedProject = projectRepository.save(project);
        activityLogService.logActivity(savedProject.getId(), userEmail, "PROJECT_CREATED", savedProject.getName());
        return mapToResponse(savedProject);
    }

    @Transactional
    public ProjectResponse updateProject(UUID id, UpdateProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));

        project.setName(request.name());
        project.setDescription(request.description());
        project.setStatus(parseStatus(request.status()));
        project.setPriority(parsePriority(request.priority()));
        project.setStartDate(request.startDate());
        project.setEndDate(request.endDate());

        Project updatedProject = projectRepository.save(project);
        return mapToResponse(updatedProject);
    }

    @Transactional
    public void deleteProject(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));
        projectRepository.delete(project);
    }

    @Transactional
    public ProjectResponse updateProjectStatus(UUID id, ProjectStatus status) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));
        project.setStatus(status);
        Project updatedProject = projectRepository.save(project);
        return mapToResponse(updatedProject);
    }

    private ProjectResponse mapToResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getStatus().name(),
                project.getPriority().name(),
                project.getCreatedBy().getId(),
                project.getCreatedBy().getName(),
                project.getStartDate(),
                project.getEndDate(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    private ProjectStatus parseStatus(String statusStr) {
        if (statusStr == null) {
            return ProjectStatus.PLANNING;
        }
        try {
            return ProjectStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ProjectStatus.PLANNING;
        }
    }

    private ProjectPriority parsePriority(String priorityStr) {
        if (priorityStr == null) {
            return ProjectPriority.MEDIUM;
        }
        try {
            return ProjectPriority.valueOf(priorityStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ProjectPriority.MEDIUM;
        }
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberResponse> getProjectMembers(UUID projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found with ID: " + projectId);
        }
        return projectMemberRepository.findByProjectId(projectId)
                .stream()
                .map(this::mapToMemberResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectMemberResponse addProjectMember(UUID projectId, AddMemberRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.userId()));

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, request.userId())) {
            throw new IllegalArgumentException("User is already a member of this project");
        }

        String roleInProject = request.roleInProject() != null && !request.roleInProject().isBlank()
                ? request.roleInProject()
                : "MEMBER";

        ProjectMember pm = ProjectMember.builder()
                .project(project)
                .user(user)
                .roleInProject(roleInProject)
                .build();

        ProjectMember saved = projectMemberRepository.save(pm);

        String currentEmail = "system@teamsync.com";
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            currentEmail = auth.getName();
        }
        activityLogService.logActivity(projectId, currentEmail, "MEMBER_ADDED", user.getName());

        // Trigger Notification
        if (!user.getEmail().equals(currentEmail)) {
            notificationService.createNotification(
                    user,
                    "Added to Project",
                    "You have been added to the project '" + project.getName() + "'",
                    "MEMBER_ADDED"
            );
        }

        return mapToMemberResponse(saved);
    }

    @Transactional
    public void removeProjectMember(UUID projectId, UUID userId) {
        ProjectMember pm = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in this project with User ID: " + userId));
        projectMemberRepository.delete(pm);
    }

    private ProjectMemberResponse mapToMemberResponse(ProjectMember pm) {
        return new ProjectMemberResponse(
                pm.getId(),
                pm.getUser().getId(),
                pm.getUser().getName(),
                pm.getUser().getEmail(),
                pm.getUser().getRole().name(),
                pm.getUser().getAvatarUrl(),
                pm.getUser().getDepartment(),
                pm.getRoleInProject(),
                pm.getJoinedAt()
        );
    }
}
