package com.haui.techstore.controller;

import com.haui.techstore.dto.ApiResponse;
import com.haui.techstore.dto.UserDTO;
import com.haui.techstore.entity.User;
import com.haui.techstore.service.UserService;
import com.haui.techstore.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "APIs for user authentication")
public class AuthenticationController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Create new user account")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(
            @Valid @RequestBody UserDTO userDTO) {

        try {
            // Check if user exists
            try {
                userService.getByEmail(userDTO.getEmail());
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(400, "Email này đã được sử dụng", null));
            } catch (Exception e) {
                // Email không tồn tại, tiếp tục đăng ký
            }

            // Create new user with default role "USER"
            userDTO.setRole("USER");
            userDTO.setStatus("ACTIVE");
            UserDTO createdUser = userService.create(userDTO);

            // Generate JWT token
            String token = jwtUtil.generateToken(createdUser.getId(), createdUser.getRole());

            Map<String, Object> response = new HashMap<>();
            response.put("user", createdUser);
            response.put("token", token);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(201, "User registered successfully", response));
        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, "Registration failed: " + e.getMessage(), null));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticate user with email and password")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(
            @RequestBody Map<String, String> loginRequest) {

        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            if (email == null || password == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(400, "Email and password are required", null));
            }

            // Get user by email
            UserDTO user = userService.getByEmail(email);
            User userEntity = userService.getByEmailEntity(email);
            // Verify password
            if (!passwordEncoder.matches(password, userEntity.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(401, "Tài khoản hoặc mật khẩu không chính xác", null));
            }

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getId(), user.getRole());

            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("token", token);

            return ResponseEntity.ok(
                    new ApiResponse<>(200, "Login successful", response));
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(401, "Tài khoản hoặc mật khẩu không chính xác", null));
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Get new JWT token using existing token")
    public ResponseEntity<ApiResponse<Map<String, String>>> refreshToken(
            @RequestHeader("Authorization") String authHeader) {

        try {
            String token = jwtUtil.extractToken(authHeader);
            if (token == null || !jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(401, "Invalid token", null));
            }

            Long userId = jwtUtil.getUserIdFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);

            String newToken = jwtUtil.generateToken(userId, role);

            Map<String, String> response = new HashMap<>();
            response.put("token", newToken);

            return ResponseEntity.ok(
                    new ApiResponse<>(200, "Token refreshed successfully", response));
        } catch (Exception e) {
            log.error("Token refresh error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(401, "Failed to refresh token", null));
        }
    }
}
