package com.teamsync.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.IOException;
import java.util.Base64;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${teamsync.cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${teamsync.cloudinary.api-key:}")
    private String apiKey;

    @Value("${teamsync.cloudinary.api-secret:}")
    private String apiSecret;

    /**
     * Uploads an avatar image.
     * If Cloudinary keys are missing or invalid, falls back to returning a base64 Data URI.
     */
    public String uploadAvatar(MultipartFile file) throws IOException {
        if (cloudName == null || cloudName.isBlank() ||
                apiKey == null || apiKey.isBlank() ||
                apiSecret == null || apiSecret.isBlank()) {
            log.warn("Cloudinary credentials not configured. Falling back to base64 Data URI mock upload.");
            return convertToDataUri(file);
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "teamsync/avatars",
                    "resource_type", "image"
            ));
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            log.error("Cloudinary upload failed: {}. Falling back to base64 Data URI mock.", e.getMessage());
            return convertToDataUri(file);
        }
    }

    private String convertToDataUri(MultipartFile file) throws IOException {
        String base64Bytes = Base64.getEncoder().encodeToString(file.getBytes());
        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "image/png";
        }
        return "data:" + contentType + ";base64," + base64Bytes;
    }
}
