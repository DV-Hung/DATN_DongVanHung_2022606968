package com.haui.techstore.dto;

import jakarta.validation.constraints.NotNull;
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
public class OrderDTO {
    private Long id;

    @NotNull(message = "User ID is required")
    private Long userId;

    private String status; // PENDING, CONFIRMED, SHIPPED, DELIVERED, COMPLETED, CANCELLED

    @NotNull(message = "Shipping address is required")
    private String shippingAddress;

    @NotNull(message = "Payment method is required")
    private String paymentMethod;

    @NotNull(message = "Customer name is required")
    private String customerName;

    @NotNull(message = "Phone is required")
    private String phone;

    @NotNull(message = "Email is required")
    private String email;

    private BigDecimal totalAmount;

    private LocalDateTime orderDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Order items
    private List<OrderItemDTO> orderItems;
}
