package com.teamsync.repository;

import com.teamsync.entity.Project;
import com.teamsync.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findAllByOrderByCreatedAtDesc();
    List<Project> findByCreatedBy(User user);
    List<Project> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);
}
