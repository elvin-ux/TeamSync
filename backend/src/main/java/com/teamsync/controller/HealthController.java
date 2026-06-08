package com.teamsync.controller;

import com.teamsync.dto.common.ApiResponse;
import java.time.Instant;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    @GetMapping
    public ApiResponse<Map<String, Object>> health() {
        return ApiResponse.success("TeamSync API is running", Map.of(
                "service", "teamsync-backend",
                "timestamp", Instant.now().toString()));
    }
}
