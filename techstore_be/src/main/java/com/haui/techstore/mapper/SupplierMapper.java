package com.haui.techstore.mapper;

import com.haui.techstore.dto.SupplierDTO;
import com.haui.techstore.entity.Supplier;
import org.springframework.stereotype.Component;

@Component
public class SupplierMapper {
    
    public SupplierDTO toDTO(Supplier entity) {
        if (entity == null) {
            return null;
        }
        
        return SupplierDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .phone(entity.getPhone())
                .address(entity.getAddress())
                .email(entity.getEmail())
                .isActive(entity.getIsActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
    
    public Supplier toEntity(SupplierDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Supplier entity = new Supplier();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setPhone(dto.getPhone());
        entity.setAddress(dto.getAddress());
        entity.setEmail(dto.getEmail());
        entity.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        
        return entity;
    }
}
