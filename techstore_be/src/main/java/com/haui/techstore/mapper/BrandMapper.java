package com.haui.techstore.mapper;

import com.haui.techstore.dto.BrandDTO;
import com.haui.techstore.entity.Brand;
import org.springframework.stereotype.Component;

@Component
public class BrandMapper {
    
    public BrandDTO toDTO(Brand entity) {
        if (entity == null) {
            return null;
        }
        
        return BrandDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .logoUrl(entity.getLogoUrl())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
    
    public Brand toEntity(BrandDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Brand entity = new Brand();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setLogoUrl(dto.getLogoUrl());
        
        return entity;
    }
}
