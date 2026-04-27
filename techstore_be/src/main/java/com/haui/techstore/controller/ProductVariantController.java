package com.haui.techstore.controller;

import com.haui.techstore.dto.ApiResponse;
import com.haui.techstore.dto.ProductVariantDTO;
import com.haui.techstore.dto.ProductDTO;
import com.haui.techstore.service.ProductVariantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-variants")
@RequiredArgsConstructor
@Tag(name = "Product Variant Management", description = "APIs for managing product variants")
public class ProductVariantController {

    private final ProductVariantService variantService;

    @GetMapping("/{id}")
    @Operation(summary = "Get variant by ID", description = "Retrieve a product variant by its ID")
    public ResponseEntity<ApiResponse<ProductVariantDTO>> getById(@PathVariable Long id) {
        ProductVariantDTO variant = variantService.getById(id);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Variant retrieved successfully", variant));
    }

    @GetMapping("/{id}/product")
    @Operation(summary = "Get product by variant ID", description = "Retrieve product with updated price (minimum) by variant ID")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductByVariantId(@PathVariable Long id) {
        ProductDTO product = variantService.getProductByVariantId(id);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Product retrieved successfully", product));
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get all variants of a product", description = "Retrieve all variants of a specific product")
    public ResponseEntity<ApiResponse<List<ProductVariantDTO>>> getByProductId(@PathVariable Long productId) {
        List<ProductVariantDTO> variants = variantService.getByProductId(productId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Variants retrieved successfully", variants));
    }

    @GetMapping("/product/{productId}/available")
    @Operation(summary = "Get available variants of a product", description = "Retrieve available (in stock) variants of a specific product")
    public ResponseEntity<ApiResponse<List<ProductVariantDTO>>> getAvailableVariants(@PathVariable Long productId) {
        List<ProductVariantDTO> variants = variantService.getAvailableVariantsByProductId(productId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Available variants retrieved successfully", variants));
    }

    @PostMapping
    @Operation(summary = "Create a new variant", description = "Create a new product variant")
    public ResponseEntity<ApiResponse<ProductVariantDTO>> create(@Valid @RequestBody ProductVariantDTO dto) {
        ProductVariantDTO created = variantService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Variant created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a variant", description = "Update an existing product variant")
    public ResponseEntity<ApiResponse<ProductVariantDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductVariantDTO dto) {
        ProductVariantDTO updated = variantService.update(id, dto);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Variant updated successfully", updated));
    }

    @PatchMapping("/{id}/stock")
    @Operation(summary = "Update variant stock", description = "Update the stock quantity of a product variant")
    public ResponseEntity<ApiResponse<ProductVariantDTO>> updateStock(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        ProductVariantDTO updated = variantService.updateStock(id, quantity);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Stock updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a variant", description = "Delete a product variant")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        variantService.delete(id);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Variant deleted successfully", null));
    }
}
