package com.haui.techstore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {
    private Long id;

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "SKU is required")
    private String sku;

    private String description;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Brand ID is required")
    private Long brandId;

    private String categoryName;

    private String brandName;

    private List<ProductVariantDTO> variants;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // For bulk price/quantity updates
    @jakarta.validation.constraints.DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private java.math.BigDecimal defaultPrice;

    @jakarta.validation.constraints.Min(value = 0, message = "Stock quantity must be non-negative")
    private Integer defaultStockQuantity;

    // Calculated fields from variants
    private Integer totalStock;

    private java.math.BigDecimal price;
}
