package com.teamsync.service;

import com.teamsync.dto.attachment.AttachmentResponse;
import com.teamsync.entity.Attachment;
import com.teamsync.entity.Task;
import com.teamsync.entity.User;
import com.teamsync.exception.ResourceNotFoundException;
import com.teamsync.repository.AttachmentRepository;
import com.teamsync.repository.TaskRepository;
import com.teamsync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsByTask(UUID taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new ResourceNotFoundException("Task not found with ID: " + taskId);
        }
        return attachmentRepository.findByTaskIdOrderByCreatedAtDesc(taskId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttachmentResponse uploadAttachment(UUID taskId, MultipartFile file, String userEmail) throws IOException {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size must not exceed 5MB");
        }

        String fileUrl = cloudinaryService.uploadFile(file);

        Attachment attachment = Attachment.builder()
                .task(task)
                .name(file.getOriginalFilename())
                .fileUrl(fileUrl)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .uploadedBy(user)
                .build();

        Attachment saved = attachmentRepository.save(attachment);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteAttachment(UUID attachmentId, String userEmail, String userRole) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with ID: " + attachmentId));

        boolean isUploader = attachment.getUploadedBy().getEmail().equals(userEmail);
        boolean isLeadOrAdmin = "ADMIN".equals(userRole) || "LEAD".equals(userRole);

        if (!isUploader && !isLeadOrAdmin) {
            throw new AccessDeniedException("You are not authorized to delete this attachment");
        }

        attachmentRepository.delete(attachment);
    }

    private AttachmentResponse mapToResponse(Attachment att) {
        return new AttachmentResponse(
                att.getId(),
                att.getTask().getId(),
                att.getName(),
                att.getFileUrl(),
                att.getFileType(),
                att.getFileSize(),
                att.getUploadedBy().getId(),
                att.getUploadedBy().getName(),
                att.getCreatedAt()
        );
    }
}
