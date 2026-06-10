package com.teamsync.controller;

import com.teamsync.dto.common.ApiResponse;
import com.teamsync.dto.activity.ActivityLogResponse;
import com.teamsync.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/activities")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityLogResponse>>> getActivitiesByProject(
            @PathVariable UUID projectId) {
        List<ActivityLogResponse> response = activityLogService.getActivitiesByProject(projectId);
        return ResponseEntity.ok(ApiResponse.success("Project activity logs retrieved successfully", response));
    }
}
