package com.haui.techstore.controller;

import com.haui.techstore.dto.ApiResponse;
import com.haui.techstore.dto.ImportOrderDTO;
import com.haui.techstore.service.ImportOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/import-orders")
@RequiredArgsConstructor
@Tag(name = "Import Order Management", description = "APIs for managing product import orders")
public class ImportOrderController {

    private final ImportOrderService importOrderService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @Operation(summary = "Create import order", description = "Create a new product import order and update stock/prices")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<ImportOrderDTO>> createImportOrder(
            @Valid @RequestBody ImportOrderDTO dto,
            Authentication authentication) {

        // Extract user ID from authentication
        // Long userId = ((Number) authentication.getPrincipal()).longValue();

        ImportOrderDTO createdOrder = importOrderService.createImportOrder(dto, Long.valueOf(1L));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Import order created successfully", createdOrder));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get import order by ID", description = "Retrieve an import order by its ID")
    public ResponseEntity<ApiResponse<ImportOrderDTO>> getById(@PathVariable Long id) {
        ImportOrderDTO order = importOrderService.getById(id);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Import order retrieved successfully", order));
    }

    @GetMapping("/supplier/{supplierId}")
    @Operation(summary = "Get import orders by supplier", description = "Retrieve all import orders from a specific supplier")
    public ResponseEntity<ApiResponse<List<ImportOrderDTO>>> getBySupplierId(@PathVariable Long supplierId) {
        List<ImportOrderDTO> orders = importOrderService.getBySupplierId(supplierId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Import orders retrieved successfully", orders));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or @authService.isCurrentUser(#userId)")
    @Operation(summary = "Get import orders by user", description = "Retrieve all import orders created by a specific user")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<List<ImportOrderDTO>>> getByUserId(@PathVariable Long userId) {
        List<ImportOrderDTO> orders = importOrderService.getByUserId(userId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Import orders retrieved successfully", orders));
    }
}
