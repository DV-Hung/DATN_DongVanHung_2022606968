package com.haui.techstore.mapper;

import com.haui.techstore.dto.OrderItemDTO;
import com.haui.techstore.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class OrderItemMapper {

    public OrderItemDTO toDTO(OrderItem entity) {
        if (entity == null) {
            return null;
        }

        BigDecimal subtotal = entity.getPriceAtPurchase()
                .multiply(BigDecimal.valueOf(entity.getQuantity()));

        return OrderItemDTO.builder()
                .id(entity.getId())
                .variantId(entity.getVariant() != null ? entity.getVariant().getId() : null)
                .quantity(entity.getQuantity())
                .priceAtPurchase(entity.getPriceAtPurchase())
                .color(entity.getVariant() != null ? entity.getVariant().getColor() : null)
                .rom(entity.getVariant() != null ? entity.getVariant().getRom() : null)
                .imageUrl(entity.getVariant() != null ? entity.getVariant().getImageUrl() : null)
                .productId(entity.getVariant() != null && entity.getVariant().getProduct() != null
                        ? entity.getVariant().getProduct().getId()
                        : null)
                .productName(entity.getVariant() != null && entity.getVariant().getProduct() != null
                        ? entity.getVariant().getProduct().getName()
                        : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .subtotal(subtotal)
                .build();
    }

    public OrderItem toEntity(OrderItemDTO dto) {
        if (dto == null) {
            return null;
        }

        OrderItem entity = new OrderItem();
        entity.setId(dto.getId());
        entity.setQuantity(dto.getQuantity());
        entity.setPriceAtPurchase(dto.getPriceAtPurchase());

        return entity;
    }
}
