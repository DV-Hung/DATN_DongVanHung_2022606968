package com.haui.techstore.controller;

import com.haui.techstore.dto.ApiResponse;
import com.haui.techstore.service.FileUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * File Upload Controller
 * Handles image upload and deletion operations
 */
@RestController
@RequestMapping("/api/files")
@Tag(name = "File Upload", description = "File upload and management operations")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileUploadService fileUploadService;

    /**
     * Upload a product image
     */
    @PostMapping("/upload/product")
    @Operation(summary = "Upload product image", description = "Upload an image to Cloudinary in the products folder")
    public ResponseEntity<ApiResponse<?>> uploadProductImage(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> uploadResult = fileUploadService.uploadFile(file, "products");

            Map<String, Object> response = new HashMap<>();
            response.put("public_id", uploadResult.get("public_id"));
            response.put("url", uploadResult.get("secure_url"));
            response.put("width", uploadResult.get("width"));
            response.put("height", uploadResult.get("height"));

            return ResponseEntity.ok(
                    ApiResponse.builder()
                            .status(200)
                            .message("Image uploaded successfully")
                            .data(response)
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.builder()
                            .status(400)
                            .message("Upload failed: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Upload a brand logo
     */
    @PostMapping("/upload/brand")
    @Operation(summary = "Upload brand logo", description = "Upload a logo image to Cloudinary in the brands folder")
    public ResponseEntity<ApiResponse<?>> uploadBrandImage(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> uploadResult = fileUploadService.uploadFile(file, "brands");

            Map<String, Object> response = new HashMap<>();
            response.put("public_id", uploadResult.get("public_id"));
            response.put("url", uploadResult.get("secure_url"));

            return ResponseEntity.ok(
                    ApiResponse.builder()
                            .status(200)
                            .message("Logo uploaded successfully")
                            .data(response)
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.builder()
                            .status(400)
                            .message("Upload failed: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Upload a category image
     */
    @PostMapping("/upload/category")
    @Operation(summary = "Upload category image", description = "Upload a category image to Cloudinary")
    public ResponseEntity<ApiResponse<?>> uploadCategoryImage(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> uploadResult = fileUploadService.uploadFile(file, "categories");

            Map<String, Object> response = new HashMap<>();
            response.put("public_id", uploadResult.get("public_id"));
            response.put("url", uploadResult.get("secure_url"));

            return ResponseEntity.ok(
                    ApiResponse.builder()
                            .status(200)
                            .message("Image uploaded successfully")
                            .data(response)
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.builder()
                            .status(400)
                            .message("Upload failed: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Delete image by public ID
     */
    @DeleteMapping("/{publicId}")
    @Operation(summary = "Delete image", description = "Delete an image from Cloudinary by its public ID")
    public ResponseEntity<ApiResponse<?>> deleteImage(@PathVariable String publicId) {
        try {
            boolean deleted = fileUploadService.deleteFile(publicId);

            if (deleted) {
                return ResponseEntity.ok(
                        ApiResponse.builder()
                                .status(200)
                                .message("Image deleted successfully")
                                .build());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.builder()
                                .status(404)
                                .message("Image not found")
                                .build());
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.builder()
                            .status(500)
                            .message("Deletion failed: " + e.getMessage())
                            .build());
        }
    }
}
