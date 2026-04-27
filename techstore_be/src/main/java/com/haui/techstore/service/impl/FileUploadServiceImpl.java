package com.haui.techstore.service.impl;

import com.cloudinary.Cloudinary;
import com.haui.techstore.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * File Upload Service Implementation
 * Handles image and file uploads to Cloudinary
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileUploadServiceImpl implements FileUploadService {

    private final Cloudinary cloudinary;

    @Override
    public Map<String, Object> uploadFile(MultipartFile file, String folder) throws Exception {
        return uploadFile(file, folder, "image");
    }

    @Override
    public Map<String, Object> uploadFile(MultipartFile file, String folder, String resourceType) throws Exception {
        try {
            validateFile(file);

            Map<String, Object> uploadParams = new HashMap<>();
            uploadParams.put("folder", folder);
            uploadParams.put("resource_type", resourceType);
            uploadParams.put("quality", "auto");
            uploadParams.put("fetch_format", "auto");

            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), uploadParams);

            log.info("File uploaded successfully. Public ID: {}", result.get("public_id"));
            return result;

        } catch (Exception e) {
            log.error("Error uploading file to Cloudinary: ", e);
            throw new Exception("Failed to upload file: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean deleteFile(String publicId) throws Exception {
        try {
            if (publicId == null || publicId.isEmpty()) {
                throw new IllegalArgumentException("Public ID cannot be null or empty");
            }

            Map<String, Object> result = cloudinary.uploader().destroy(publicId, new HashMap<>());

            String resultStatus = (String) result.get("result");
            boolean success = "ok".equals(resultStatus);

            if (success) {
                log.info("File deleted successfully. Public ID: {}", publicId);
            } else {
                log.warn("Failed to delete file. Public ID: {}, Result: {}", publicId, resultStatus);
            }

            return success;

        } catch (Exception e) {
            log.error("Error deleting file from Cloudinary: ", e);
            throw new Exception("Failed to delete file: " + e.getMessage(), e);
        }
    }

    @Override
    public String getSecureUrl(String publicId) {
        if (publicId == null || publicId.isEmpty()) {
            return null;
        }
        return cloudinary.url().secure(true).generate(publicId);
    }

    /**
     * Validate the uploaded file
     */
    private void validateFile(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        long maxSize = 5 * 1024 * 1024; // 5MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size must be less than 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
    }
}
