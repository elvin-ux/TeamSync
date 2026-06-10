package com.teamsync.service;

import com.teamsync.dto.search.*;
import com.teamsync.entity.*;
import com.teamsync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;

    @Transactional(readOnly = true)
    public SearchResponse searchAll(String query) {
        if (query == null || query.trim().length() < 2) {
            return new SearchResponse(List.of(), List.of(), List.of(), List.of());
        }

        String trimmedQuery = query.trim();

        // 1. Search Projects
        List<ProjectSearchDto> projects = projectRepository
                .findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(trimmedQuery, trimmedQuery)
                .stream()
                .map(p -> new ProjectSearchDto(p.getId(), p.getName(), p.getDescription()))
                .collect(Collectors.toList());

        // 2. Search Tasks
        List<TaskSearchDto> tasks = taskRepository
                .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(trimmedQuery, trimmedQuery)
                .stream()
                .map(t -> new TaskSearchDto(
                        t.getId(),
                        t.getTitle(),
                        t.getProject().getId(),
                        t.getProject().getName(),
                        t.getStatus().name()
                ))
                .collect(Collectors.toList());

        // 3. Search Members (Users)
        List<MemberSearchDto> members = userRepository
                .findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(trimmedQuery, trimmedQuery)
                .stream()
                .map(u -> new MemberSearchDto(u.getId(), u.getName(), u.getEmail(), u.getAvatarUrl()))
                .collect(Collectors.toList());

        // 4. Search Comments
        List<CommentSearchDto> comments = commentRepository
                .findByContentContainingIgnoreCase(trimmedQuery)
                .stream()
                .map(c -> new CommentSearchDto(
                        c.getId(),
                        c.getContent(),
                        c.getTask().getId(),
                        c.getTask().getTitle(),
                        c.getTask().getProject().getId(),
                        c.getAuthor().getName()
                ))
                .collect(Collectors.toList());

        return new SearchResponse(projects, tasks, members, comments);
    }
}
