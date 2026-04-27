package com.haui.techstore.mapper;

import com.haui.techstore.dto.CategoryDTO;
import com.haui.techstore.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {
    
    public CategoryDTO toDTO(Category entity) {
        if (entity == null) {
            return null;
        }
        
        return CategoryDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .slug(entity.getSlug())
                .isActive(entity.getIsActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
    
    public Category toEntity(CategoryDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Category entity = new Category();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setSlug(dto.getSlug());
        entity.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        
        return entity;
    }
}
