package com.haui.techstore.mapper;

import com.haui.techstore.dto.ProductDTO;
import com.haui.techstore.dto.ProductVariantDTO;
import com.haui.techstore.entity.Product;
import com.haui.techstore.entity.ProductVariant;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class ProductMapper {

    public ProductDTO toDTO(Product entity) {
        if (entity == null) {
            return null;
        }

        // Calculate total stock from variants
        Integer totalStock = 0;
        BigDecimal minPrice = null;
        
        if (entity.getVariants() != null && !entity.getVariants().isEmpty()) {
            totalStock = entity.getVariants().stream()
                    .mapToInt(ProductVariant::getStockQuantity)
                    .sum();
            
            // Find minimum price from variants
            minPrice = entity.getVariants().stream()
                    .map(ProductVariant::getPrice)
                    .min(BigDecimal::compareTo)
                    .orElse(null);
        }

        // Map variants
        List<ProductVariantDTO> variantDTOs = null;
        if (entity.getVariants() != null && !entity.getVariants().isEmpty()) {
            variantDTOs = entity.getVariants().stream()
                    .map(variant -> ProductVariantDTO.builder()
                            .id(variant.getId())
                            .color(variant.getColor())
                            .rom(variant.getRom())
                            .price(variant.getPrice())
                            .stockQuantity(variant.getStockQuantity())
                            .imageUrl(variant.getImageUrl())
                            .productId(variant.getProduct().getId())
                            .productName(variant.getProduct().getName())
                            .createdAt(variant.getCreatedAt())
                            .updatedAt(variant.getUpdatedAt())
                            .build())
                    .collect(java.util.stream.Collectors.toList());
        }

        return ProductDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .sku(entity.getSku())
                .description(entity.getDescription())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
                .brandId(entity.getBrand() != null ? entity.getBrand().getId() : null)
                .brandName(entity.getBrand() != null ? entity.getBrand().getName() : null)
                .variants(variantDTOs)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .totalStock(totalStock)
                .price(minPrice)
                .build();
    }

    public Product toEntity(ProductDTO dto) {
        if (dto == null) {
            return null;
        }

        Product entity = new Product();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setSku(dto.getSku());
        return entity;
    }
}
