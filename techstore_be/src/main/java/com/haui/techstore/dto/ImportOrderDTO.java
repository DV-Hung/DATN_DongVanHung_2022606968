package com.haui.techstore.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportOrderDTO {
    private Long id;

    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    private String supplierName;

    @NotNull(message = "Import details are required")
    @Size(min = 1, message = "At least one import detail is required")
    private List<@Valid ImportDetailDTO> importDetails;

    private BigDecimal totalCost;

    private LocalDateTime importDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
