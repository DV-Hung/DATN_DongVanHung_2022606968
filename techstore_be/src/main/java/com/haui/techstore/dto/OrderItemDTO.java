package com.haui.techstore.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
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
public class OrderItemDTO {
    private Long id;

    @NotNull(message = "Variant ID is required")
    private Long variantId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private BigDecimal priceAtPurchase;

    // Variant details
    private String color;

    private String rom;

    private String imageUrl;

    // Product details
    private Long productId;

    private String productName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Calculated field
    private BigDecimal subtotal;
}
