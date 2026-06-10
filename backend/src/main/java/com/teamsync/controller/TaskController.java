package com.teamsync.controller;

import com.teamsync.dto.common.ApiResponse;
import com.teamsync.dto.task.CreateTaskRequest;
import com.teamsync.dto.task.TaskResponse;
import com.teamsync.dto.task.UpdateTaskRequest;
import com.teamsync.entity.TaskPriority;
import com.teamsync.entity.TaskStatus;
import com.teamsync.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByProject(
            @PathVariable UUID projectId,
            Authentication authentication) {
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .findFirst()
                .orElse("MEMBER");
        List<TaskResponse> response = taskService.getTasksByProject(projectId, authentication.getName(), role);
        return ResponseEntity.ok(ApiResponse.success("Tasks retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(
            @PathVariable UUID id,
            Authentication authentication) {
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .findFirst()
                .orElse("MEMBER");
        TaskResponse response = taskService.getTaskById(id, authentication.getName(), role);
        return ResponseEntity.ok(ApiResponse.success("Task retrieved successfully", response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LEAD')")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication) {
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .findFirst()
                .orElse("MEMBER");
        TaskResponse response = taskService.createTask(request, authentication.getName(), role);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LEAD')")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTaskRequest request,
            Authentication authentication) {
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .findFirst()
                .orElse("MEMBER");
        TaskResponse response = taskService.updateTask(id, request, authentication.getName(), role);
        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LEAD')")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable UUID id,
            Authentication authentication) {
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .findFirst()
                .orElse("MEMBER");
        taskService.deleteTask(id, authentication.getName(), role);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", null));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateStatus(
            @PathVariable UUID id,
            @RequestParam("status") TaskStatus status,
            Authentication authentication) {
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .findFirst()
                .orElse("MEMBER");
        TaskResponse response = taskService.updateTaskStatus(id, status, authentication.getName(), role);
        return ResponseEntity.ok(ApiResponse.success("Task status updated successfully", response));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'LEAD')")
    public ResponseEntity<ApiResponse<TaskResponse>> assignTask(
            @PathVariable UUID id,
            @RequestParam(value = "userId", required = false) UUID userId,
            Authentication authentication) {
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .findFirst()
                .orElse("MEMBER");
        TaskResponse response = taskService.assignTask(id, userId, authentication.getName(), role);
        return ResponseEntity.ok(ApiResponse.success("Task assignment updated successfully", response));
    }
}
