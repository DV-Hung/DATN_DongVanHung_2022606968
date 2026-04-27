package com.haui.techstore.controller;

import com.haui.techstore.dto.ApiResponse;
import com.haui.techstore.dto.BrandDTO;
import com.haui.techstore.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
@Tag(name = "Brand Management", description = "APIs for managing product brands")
public class BrandController {
    
    private final BrandService brandService;
    
    @GetMapping
    @Operation(summary = "Get all brands", description = "Retrieve all product brands")
    public ResponseEntity<ApiResponse<List<BrandDTO>>> getAll() {
        List<BrandDTO> brands = brandService.getAll();
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Brands retrieved successfully", brands)
        );
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get brand by ID", description = "Retrieve a brand by its ID")
    public ResponseEntity<ApiResponse<BrandDTO>> getById(@PathVariable Long id) {
        BrandDTO brand = brandService.getById(id);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Brand retrieved successfully", brand)
        );
    }
    
    @PostMapping
    @Operation(summary = "Create a new brand", description = "Create a new product brand")
    public ResponseEntity<ApiResponse<BrandDTO>> create(@Valid @RequestBody BrandDTO dto) {
        BrandDTO created = brandService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Brand created successfully", created));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update a brand", description = "Update an existing product brand")
    public ResponseEntity<ApiResponse<BrandDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody BrandDTO dto) {
        BrandDTO updated = brandService.update(id, dto);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Brand updated successfully", updated)
        );
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a brand", description = "Delete a product brand")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        brandService.delete(id);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Brand deleted successfully", null)
        );
    }
}
