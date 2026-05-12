package com.haui.techstore.controller;

import com.haui.techstore.dto.ApiResponse;
import com.haui.techstore.dto.UserDTO;
import com.haui.techstore.service.UserService;
import com.haui.techstore.service.SystemLogsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

        private final UserService userService;
        private final SystemLogsService systemLogsService;

        @GetMapping
        @PreAuthorize("hasRole('ADMIN')")
        @Operation(summary = "Get all users", description = "Retrieve all users with pagination")
        public ResponseEntity<ApiResponse<Page<UserDTO>>> getAll(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<UserDTO> users = userService.getAllPaginated(pageable);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Users retrieved successfully", users));
        }

        @GetMapping("/all")
        @PreAuthorize("hasRole('ADMIN')")
        @Operation(summary = "Get all users without pagination", description = "Retrieve all users as a list")
        public ResponseEntity<ApiResponse<List<UserDTO>>> getAllList() {
                List<UserDTO> users = userService.getAll();
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Users retrieved successfully", users));
        }

        @GetMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal")
        @Operation(summary = "Get user by ID", description = "Retrieve a user by their ID")
        public ResponseEntity<ApiResponse<UserDTO>> getById(@PathVariable Long id) {
                UserDTO user = userService.getById(id);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "User retrieved successfully", user));
        }

        @GetMapping("/search/email")
        @PreAuthorize("hasRole('ADMIN')")
        @Operation(summary = "Search users by email", description = "Search for users by email address")
        public ResponseEntity<ApiResponse<Page<UserDTO>>> searchByEmail(
                        @RequestParam String email,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<UserDTO> users = userService.searchByEmail(email, pageable);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Search results", users));
        }

        @GetMapping("/search/fullname")
        @PreAuthorize("hasRole('ADMIN')")
        @Operation(summary = "Search users by full name", description = "Search for users by full name")
        public ResponseEntity<ApiResponse<Page<UserDTO>>> searchByFullName(
                        @RequestParam String fullName,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<UserDTO> users = userService.searchByFullName(fullName, pageable);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Search results", users));
        }

        @PostMapping
        @PreAuthorize("hasRole('ADMIN')")
        @Operation(summary = "Create a new user", description = "Create a new user account")
        public ResponseEntity<ApiResponse<UserDTO>> create(@Valid @RequestBody UserDTO userDTO) {
                UserDTO createdUser = userService.create(userDTO);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(new ApiResponse<>(201, "User created successfully", createdUser));
        }

        @PutMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal")
        @Operation(summary = "Update user", description = "Update an existing user")
        public ResponseEntity<ApiResponse<UserDTO>> update(
                        @PathVariable Long id,
                        @Valid @RequestBody UserDTO userDTO) {
                UserDTO updatedUser = userService.update(id, userDTO);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "User updated successfully", updatedUser));
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        @Operation(summary = "Deactivate user", description = "Deactivate a user by setting status to inactive")
        public ResponseEntity<ApiResponse<String>> delete(
                        @PathVariable Long id,
                        Authentication authentication) {
                Long currentUserId = extractUserIdFromAuth(authentication);

                // Get user info before deactivation for logging
                UserDTO user = userService.getById(id);
                String oldStatus = user.getStatus();

                // Deactivate user
                userService.updateUserStatus(id, "INACTIVE");

                // Log the action
                systemLogsService.saveLog(
                                currentUserId,
                                "DEACTIVATE_USER",
                                "users",
                                id,
                                oldStatus,
                                "INACTIVE");

                return ResponseEntity.ok(
                                new ApiResponse<>(200, "User deactivated successfully",
                                                "User with id " + id + " has been deactivated"));
        }

        /**
         * Trích xuất userId từ JWT Authentication token
         * 
         * @param authentication Authentication object chứa thông tin từ JWT token
         * @return userId được lấy từ token, hoặc null nếu không tìm thấy
         */
        private Long extractUserIdFromAuth(Authentication authentication) {
                if (authentication != null && authentication.getPrincipal() != null) {
                        try {
                                Object principal = authentication.getPrincipal();
                                if (principal instanceof Long) {
                                        return (Long) principal;
                                } else if (principal instanceof String) {
                                        return Long.parseLong((String) principal);
                                }
                        } catch (NumberFormatException e) {
                                // Log error if needed
                        }
                }
                return null;
        }
}
