package com.haui.techstore.mapper;

import com.haui.techstore.dto.CartItemDTO;
import com.haui.techstore.entity.CartItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class CartItemMapper {

    public CartItemDTO toDTO(CartItem entity) {
        if (entity == null) {
            return null;
        }

        BigDecimal price = entity.getVariant() != null ? entity.getVariant().getPrice() : BigDecimal.ZERO;
        BigDecimal totalPrice = price.multiply(BigDecimal.valueOf(entity.getQuantity()));

        return CartItemDTO.builder()
                .id(entity.getId())
                .quantity(entity.getQuantity())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .variantId(entity.getVariant() != null ? entity.getVariant().getId() : null)
                .color(entity.getVariant() != null ? entity.getVariant().getColor() : null)
                .rom(entity.getVariant() != null ? entity.getVariant().getRom() : null)
                .price(price)
                .stockQuantity(entity.getVariant() != null ? entity.getVariant().getStockQuantity() : null)
                .imageUrl(entity.getVariant() != null ? entity.getVariant().getImageUrl() : null)
                .productId(entity.getVariant() != null && entity.getVariant().getProduct() != null
                        ? entity.getVariant().getProduct().getId()
                        : null)
                .productName(entity.getVariant() != null && entity.getVariant().getProduct() != null
                        ? entity.getVariant().getProduct().getName()
                        : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .totalPrice(totalPrice)
                .build();
    }

    public CartItem toEntity(CartItemDTO dto) {
        if (dto == null) {
            return null;
        }

        CartItem entity = new CartItem();
        entity.setId(dto.getId());
        entity.setQuantity(dto.getQuantity());

        return entity;
    }
}
