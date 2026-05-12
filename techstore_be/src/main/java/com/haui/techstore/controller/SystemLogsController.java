package com.haui.techstore.controller;

import com.haui.techstore.dto.ApiResponse;
import com.haui.techstore.dto.SystemLogsDTO;
import com.haui.techstore.service.SystemLogsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system-logs")
@RequiredArgsConstructor
@Tag(name = "System Logs", description = "APIs for managing system logs")
public class SystemLogsController {

    private final SystemLogsService systemLogsService;

    @GetMapping
    @Operation(summary = "Get all system logs", description = "Retrieve all system logs with pagination (admin only)")
    public ResponseEntity<ApiResponse<Page<SystemLogsDTO>>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SystemLogsDTO> logs = systemLogsService.getAllLogs(pageable);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy danh sách log hệ thống thành công", logs));
    }

}
