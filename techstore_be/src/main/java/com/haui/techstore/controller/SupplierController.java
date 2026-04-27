package com.haui.techstore.controller;

import com.haui.techstore.dto.ApiResponse;
import com.haui.techstore.dto.SupplierDTO;
import com.haui.techstore.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@Tag(name = "Supplier Management", description = "APIs for managing suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    @Operation(summary = "Get all suppliers", description = "Retrieve all suppliers")
    public ResponseEntity<ApiResponse<List<SupplierDTO>>> getAll() {
        List<SupplierDTO> suppliers = supplierService.getAll();
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Suppliers retrieved successfully", suppliers));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get supplier by ID", description = "Retrieve a supplier by its ID")
    public ResponseEntity<ApiResponse<SupplierDTO>> getById(@PathVariable Long id) {
        SupplierDTO supplier = supplierService.getById(id);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Supplier retrieved successfully", supplier));
    }

    @PostMapping
    @Operation(summary = "Create a new supplier", description = "Create a new supplier")
    public ResponseEntity<ApiResponse<SupplierDTO>> create(@Valid @RequestBody SupplierDTO dto) {
        SupplierDTO created = supplierService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Supplier created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a supplier", description = "Update an existing supplier")
    public ResponseEntity<ApiResponse<SupplierDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody SupplierDTO dto) {
        SupplierDTO updated = supplierService.update(id, dto);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Supplier updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate a supplier", description = "Deactivate a supplier by setting status to inactive")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        supplierService.delete(id);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Supplier deactivated successfully", null));
    }
}
