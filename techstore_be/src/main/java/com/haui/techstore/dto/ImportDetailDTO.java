package com.haui.techstore.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.DecimalMin;
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
public class ImportDetailDTO {
    private Long id;

    @NotNull(message = "Variant ID is required")
    private Long variantId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Import price is required")
    @DecimalMin(value = "0.01", message = "Import price must be greater than 0")
    private BigDecimal importPrice;

    private Long supplierId;

    private String supplierName;

    private String productName;

    private String color;

    private String rom;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
