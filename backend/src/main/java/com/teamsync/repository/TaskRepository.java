package com.teamsync.repository;

import com.teamsync.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByProjectIdOrderByCreatedAtDesc(UUID projectId);
    List<Task> findByAssignedToIdOrderByCreatedAtDesc(UUID assignedToId);
    List<Task> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);
}
