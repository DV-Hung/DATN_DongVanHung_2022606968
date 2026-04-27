package com.haui.techstore.controller;

import com.haui.techstore.dto.ApiResponse;
import com.haui.techstore.dto.UserDTO;
import com.haui.techstore.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

        private final UserService userService;

        @GetMapping
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
        @Operation(summary = "Get all users without pagination", description = "Retrieve all users as a list")
        public ResponseEntity<ApiResponse<List<UserDTO>>> getAllList() {
                List<UserDTO> users = userService.getAll();
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Users retrieved successfully", users));
        }

        @GetMapping("/{id}")
        @Operation(summary = "Get user by ID", description = "Retrieve a user by their ID")
        public ResponseEntity<ApiResponse<UserDTO>> getById(@PathVariable Long id) {
                UserDTO user = userService.getById(id);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "User retrieved successfully", user));
        }

        @GetMapping("/search/email")
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
        @Operation(summary = "Create a new user", description = "Create a new user account")
        public ResponseEntity<ApiResponse<UserDTO>> create(@Valid @RequestBody UserDTO userDTO) {
                UserDTO createdUser = userService.create(userDTO);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(new ApiResponse<>(201, "User created successfully", createdUser));
        }

        @PutMapping("/{id}")
        @Operation(summary = "Update user", description = "Update an existing user")
        public ResponseEntity<ApiResponse<UserDTO>> update(
                        @PathVariable Long id,
                        @Valid @RequestBody UserDTO userDTO) {
                UserDTO updatedUser = userService.update(id, userDTO);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "User updated successfully", updatedUser));
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "Deactivate user", description = "Deactivate a user by setting status to inactive")
        public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
                userService.updateUserStatus(id, "inactive");
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "User deactivated successfully",
                                                "User with id " + id + " has been deactivated"));
        }

        @DeleteMapping("/email/{email}")
        @Operation(summary = "Delete user by email", description = "Delete a user by email address")
        public ResponseEntity<ApiResponse<String>> deleteByEmail(@PathVariable String email) {
                userService.deleteByEmail(email);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "User deleted successfully",
                                                "User with email " + email + " has been deleted"));
        }
}
