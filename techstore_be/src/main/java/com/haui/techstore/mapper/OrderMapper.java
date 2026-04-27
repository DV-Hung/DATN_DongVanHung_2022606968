package com.haui.techstore.mapper;

import com.haui.techstore.dto.OrderDTO;
import com.haui.techstore.entity.Order;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public OrderDTO toDTO(Order entity) {
        if (entity == null) {
            return null;
        }

        return OrderDTO.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .status(entity.getStatus())
                .shippingAddress(entity.getShippingAddress())
                .paymentMethod(entity.getPaymentMethod())
                .customerName(entity.getCustomerName())
                .phone(entity.getPhone())
                .email(entity.getEmail())
                .totalAmount(entity.getTotalAmount())
                .orderDate(entity.getOrderDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Order toEntity(OrderDTO dto) {
        if (dto == null) {
            return null;
        }

        Order entity = new Order();
        entity.setId(dto.getId());
        entity.setShippingAddress(dto.getShippingAddress());
        entity.setPaymentMethod(dto.getPaymentMethod());
        entity.setCustomerName(dto.getCustomerName());
        entity.setPhone(dto.getPhone());
        entity.setEmail(dto.getEmail());
        entity.setTotalAmount(dto.getTotalAmount());
        entity.setStatus(dto.getStatus());

        return entity;
    }
}
