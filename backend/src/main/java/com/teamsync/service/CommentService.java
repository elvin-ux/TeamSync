package com.teamsync.service;

import com.teamsync.dto.comment.CommentResponse;
import com.teamsync.dto.comment.CreateCommentRequest;
import com.teamsync.dto.comment.UpdateCommentRequest;
import com.teamsync.entity.Comment;
import com.teamsync.entity.Task;
import com.teamsync.entity.User;
import com.teamsync.exception.ResourceNotFoundException;
import com.teamsync.repository.CommentRepository;
import com.teamsync.repository.TaskRepository;
import com.teamsync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByTask(UUID taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new ResourceNotFoundException("Task not found with ID: " + taskId);
        }
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse createComment(CreateCommentRequest request, String authorEmail) {
        Task task = taskRepository.findById(request.taskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + request.taskId()));

        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + authorEmail));

        Comment comment = Comment.builder()
                .task(task)
                .author(author)
                .content(request.content())
                .build();

        Comment saved = commentRepository.save(comment);

        // Trigger notifications for task assignee and task creator (excluding comment author)
        User assignee = task.getAssignedTo();
        User creator = task.getCreatedBy();
        String commentPreview = comment.getContent().length() > 60
                ? comment.getContent().substring(0, 57) + "..."
                : comment.getContent();

        if (assignee != null && !assignee.getEmail().equals(authorEmail)) {
            notificationService.createNotification(
                    assignee,
                    "New Comment on Task",
                    author.getName() + " commented on '" + task.getTitle() + "': \"" + commentPreview + "\"",
                    "COMMENT_ADDED"
            );
        }
        if (creator != null && !creator.getEmail().equals(authorEmail) && (assignee == null || !creator.getId().equals(assignee.getId()))) {
            notificationService.createNotification(
                    creator,
                    "New Comment on Task",
                    author.getName() + " commented on '" + task.getTitle() + "': \"" + commentPreview + "\"",
                    "COMMENT_ADDED"
            );
        }

        return mapToResponse(saved);
    }

    @Transactional
    public CommentResponse updateComment(UUID commentId, UpdateCommentRequest request, String authorEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID: " + commentId));

        if (!comment.getAuthor().getEmail().equals(authorEmail)) {
            throw new AccessDeniedException("You are not authorized to update this comment");
        }

        comment.setContent(request.content());
        Comment updated = commentRepository.save(comment);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteComment(UUID commentId, String userEmail, String userRole) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID: " + commentId));

        boolean isAuthor = comment.getAuthor().getEmail().equals(userEmail);
        boolean isLeadOrAdmin = "ADMIN".equals(userRole) || "LEAD".equals(userRole);

        if (!isAuthor && !isLeadOrAdmin) {
            throw new AccessDeniedException("You are not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }

    private CommentResponse mapToResponse(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getTask().getId(),
                comment.getAuthor().getId(),
                comment.getAuthor().getName(),
                comment.getAuthor().getEmail(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}
