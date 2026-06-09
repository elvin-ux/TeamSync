package com.teamsync.service;

import com.teamsync.dto.project.CreateProjectRequest;
import com.teamsync.dto.project.ProjectResponse;
import com.teamsync.dto.project.UpdateProjectRequest;
import com.teamsync.entity.Project;
import com.teamsync.entity.ProjectPriority;
import com.teamsync.entity.ProjectStatus;
import com.teamsync.entity.User;
import com.teamsync.exception.ResourceNotFoundException;
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
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

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
}
