package com.haui.techstore.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * File Upload Service Interface
 * Defines contract for file upload operations
 */
public interface FileUploadService {

    /**
     * Upload a file to Cloudinary
     * 
     * @param file   The file to upload
     * @param folder The folder in Cloudinary where the file will be stored
     * @return A map containing upload result details (URL, public_id, etc.)
     * @throws Exception if upload fails
     */
    Map<String, Object> uploadFile(MultipartFile file, String folder) throws Exception;

    /**
     * Upload a file to Cloudinary with custom resource type
     *
     * @param file         The file to upload
     * @param folder       The folder in Cloudinary
     * @param resourceType The type of resource (image, video, raw, etc.)
     * @return A map containing upload result details
     * @throws Exception if upload fails
     */
    Map<String, Object> uploadFile(MultipartFile file, String folder, String resourceType) throws Exception;

    /**
     * Delete a file from Cloudinary
     *
     * @param publicId The public ID of the file to delete
     * @return True if deletion was successful, false otherwise
     * @throws Exception if deletion fails
     */
    boolean deleteFile(String publicId) throws Exception;

    /**
     * Get the secure URL for a file by public ID
     *
     * @param publicId The public ID of the file
     * @return The secure HTTPS URL to the file
     */
    String getSecureUrl(String publicId);
}
