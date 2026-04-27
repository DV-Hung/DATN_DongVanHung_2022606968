package com.haui.techstore.mapper;

import com.haui.techstore.dto.ProductVariantDTO;
import com.haui.techstore.entity.ProductVariant;
import org.springframework.stereotype.Component;

@Component
public class ProductVariantMapper {

    public ProductVariantDTO toDTO(ProductVariant entity) {
        if (entity == null) {
            return null;
        }

        return ProductVariantDTO.builder()
                .id(entity.getId())
                .color(entity.getColor())
                .rom(entity.getRom())
                .price(entity.getPrice())
                .stockQuantity(entity.getStockQuantity())
                .imageUrl(entity.getImageUrl())
                .productId(entity.getProduct() != null ? entity.getProduct().getId() : null)
                .productName(entity.getProduct() != null ? entity.getProduct().getName() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public ProductVariant toEntity(ProductVariantDTO dto) {
        if (dto == null) {
            return null;
        }

        ProductVariant entity = new ProductVariant();
        entity.setId(dto.getId());
        entity.setColor(dto.getColor());
        entity.setRom(dto.getRom());
        entity.setPrice(dto.getPrice());
        entity.setStockQuantity(dto.getStockQuantity());
        entity.setImageUrl(dto.getImageUrl());

        return entity;
    }
}
