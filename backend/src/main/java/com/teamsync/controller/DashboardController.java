package com.teamsync.controller;

import com.teamsync.dto.common.ApiResponse;
import com.teamsync.dto.dashboard.DashboardStatsResponse;
import com.teamsync.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats(Principal principal) {
        DashboardStatsResponse response = dashboardService.getStats(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved successfully", response));
    }
}
