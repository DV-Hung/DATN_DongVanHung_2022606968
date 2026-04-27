package com.haui.techstore.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantDTO {
    private Long id;

    private String color;

    private String rom;

    private BigDecimal price;

    @Min(value = 0, message = "Stock quantity must be non-negative")
    private Integer stockQuantity;

    private String imageUrl;

    @NotNull(message = "Product ID is required")
    private Long productId;

    private String productName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
