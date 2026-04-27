package com.haui.techstore.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartSummary {
    private Long userId;
    private Integer totalItems;
    private BigDecimal totalPrice;
}
