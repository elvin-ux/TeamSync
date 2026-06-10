package com.teamsync.controller;

import com.teamsync.dto.common.ApiResponse;
import com.teamsync.dto.attachment.AttachmentResponse;
import com.teamsync.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks/{taskId}/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttachmentResponse>>> getAttachmentsByTask(
            @PathVariable UUID taskId) {
        List<AttachmentResponse> response = attachmentService.getAttachmentsByTask(taskId);
        return ResponseEntity.ok(ApiResponse.success("Task attachments retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AttachmentResponse>> uploadAttachment(
            @PathVariable UUID taskId,
            @RequestParam("file") MultipartFile file,
            Principal principal) throws IOException {
        AttachmentResponse response = attachmentService.uploadAttachment(taskId, file, principal.getName());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("File attached successfully", response));
    }

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteAttachment(
            @PathVariable UUID taskId,
            @PathVariable UUID attachmentId,
            Authentication authentication) {
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .findFirst()
                .orElse("MEMBER");
        attachmentService.deleteAttachment(attachmentId, authentication.getName(), role);
        return ResponseEntity.ok(ApiResponse.success("Attachment deleted successfully", null));
    }
}
