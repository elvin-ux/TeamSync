package com.teamsync.service;

import com.teamsync.dto.user.UpdateProfileRequest;
import com.teamsync.dto.user.UserProfileResponse;
import com.teamsync.entity.User;
import com.teamsync.exception.ResourceNotFoundException;
import com.teamsync.repository.UserRepository;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        user.setName(request.name());
        user.setDepartment(request.department());
        user.setBio(request.bio());

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    @Transactional
    public UserProfileResponse updateAvatar(String email, MultipartFile file) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        String avatarUrl = cloudinaryService.uploadAvatar(file);
        user.setAvatarUrl(avatarUrl);

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    private UserProfileResponse mapToResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getAvatarUrl(),
                user.getDepartment(),
                user.getBio(),
                user.getCreatedAt()
        );
    }
}
