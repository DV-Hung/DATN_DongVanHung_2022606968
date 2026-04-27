package com.haui.techstore.mapper;

import com.haui.techstore.dto.ImportDetailDTO;
import com.haui.techstore.entity.ImportDetail;
import org.springframework.stereotype.Component;

@Component
public class ImportDetailMapper {

    public ImportDetailDTO toDTO(ImportDetail entity) {
        if (entity == null) {
            return null;
        }

        return ImportDetailDTO.builder()
                .id(entity.getId())
                .variantId(entity.getVariant().getId())
                .quantity(entity.getQuantity())
                .importPrice(entity.getImportPrice())
                .productName(entity.getVariant().getProduct().getName())
                .color(entity.getVariant().getColor())
                .rom(entity.getVariant().getRom())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public ImportDetail toEntity(ImportDetailDTO dto) {
        if (dto == null) {
            return null;
        }

        ImportDetail entity = new ImportDetail();
        entity.setId(dto.getId());
        entity.setQuantity(dto.getQuantity());
        entity.setImportPrice(dto.getImportPrice());

        return entity;
    }
}
