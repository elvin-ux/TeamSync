package com.teamsync.controller;

import com.teamsync.dto.common.ApiResponse;
import com.teamsync.dto.notification.NotificationResponse;
import com.teamsync.service.NotificationService;
import com.teamsync.service.SseEmitterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final SseEmitterService sseEmitterService;

    /**
     * SSE stream endpoint – each authenticated user connects here to receive
     * real-time notification push events without polling.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(Principal principal) {
        return sseEmitterService.addEmitter(principal.getName());
    }
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(Principal principal) {
        List<NotificationResponse> response = notificationService.getNotificationsByUser(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", response));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Principal principal) {
        long count = notificationService.getUnreadCount(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved successfully", count));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable UUID notificationId,
            Principal principal) {
        notificationService.markAsRead(notificationId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read successfully", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Principal principal) {
        notificationService.markAllAsRead(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read successfully", null));
    }
}
