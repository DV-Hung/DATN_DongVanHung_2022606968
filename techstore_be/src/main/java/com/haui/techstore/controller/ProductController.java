package com.haui.techstore.controller;

import com.haui.techstore.dto.ApiResponse;
import com.haui.techstore.dto.ProductDTO;
import com.haui.techstore.service.ProductService;
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

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Product Management", description = "APIs for managing products")
public class ProductController {

        private final ProductService productService;

        @GetMapping
        @Operation(summary = "Get all products", description = "Retrieve all products with pagination")
        public ResponseEntity<ApiResponse<Page<ProductDTO>>> getAll(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<ProductDTO> products = productService.getAllPaginated(pageable);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Products retrieved successfully", products));
        }

        @GetMapping("/all")
        @Operation(summary = "Get all products without pagination", description = "Retrieve all products as a list")
        public ResponseEntity<ApiResponse<List<ProductDTO>>> getAllList() {
                List<ProductDTO> products = productService.getAll();
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Products retrieved successfully", products));
        }

        @GetMapping("/{id}")
        @Operation(summary = "Get product by ID", description = "Retrieve a product by its ID")
        public ResponseEntity<ApiResponse<ProductDTO>> getById(@PathVariable Long id) {
                ProductDTO product = productService.getById(id);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Product retrieved successfully", product));
        }

        @GetMapping("/search")
        @Operation(summary = "Search products by name", description = "Search for products by name")
        public ResponseEntity<ApiResponse<Page<ProductDTO>>> search(
                        @RequestParam String name,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<ProductDTO> products = productService.searchByName(name, pageable);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Search results", products));
        }

        @GetMapping("/category/{categoryId}")
        @Operation(summary = "Get products by category with filters", description = "Retrieve products by category ID with optional price range and brand name filters")
        public ResponseEntity<ApiResponse<Page<ProductDTO>>> getByCategory(
                        @PathVariable Long categoryId,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(required = false) Double minPrice,
                        @RequestParam(required = false) Double maxPrice,
                        @RequestParam(required = false) String brandNames) {
                Pageable pageable = PageRequest.of(page, size);

                // Parse brandNames - split by comma if provided
                List<String> brands = brandNames != null && !brandNames.isEmpty()
                                ? Arrays.asList(brandNames.split(","))
                                : null;

                Page<ProductDTO> products = productService.filterByCategoryWithOptions(
                                categoryId, minPrice, maxPrice, brands, pageable);

                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Products retrieved successfully", products));
        }

        @GetMapping("/brand/{brandId}")
        @Operation(summary = "Get products by brand", description = "Retrieve products by brand ID")
        public ResponseEntity<ApiResponse<Page<ProductDTO>>> getByBrand(
                        @PathVariable Long brandId,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<ProductDTO> products = productService.filterByBrand(brandId, pageable);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Products retrieved successfully", products));
        }

        @PostMapping
        @Operation(summary = "Create a new product", description = "Create a new product")
        public ResponseEntity<ApiResponse<ProductDTO>> create(@Valid @RequestBody ProductDTO dto) {
                ProductDTO created = productService.create(dto);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(new ApiResponse<>(201, "Product created successfully", created));
        }

        @PutMapping("/{id}")
        @Operation(summary = "Update a product", description = "Update an existing product")
        public ResponseEntity<ApiResponse<ProductDTO>> update(
                        @PathVariable Long id,
                        @Valid @RequestBody ProductDTO dto) {
                ProductDTO updated = productService.update(id, dto);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Product updated successfully", updated));
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "Delete a product", description = "Delete an existing product")
        public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
                productService.delete(id);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Product deleted successfully", null));
        }
}
