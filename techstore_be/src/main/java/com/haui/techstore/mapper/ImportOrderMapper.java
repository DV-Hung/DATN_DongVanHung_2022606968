package com.haui.techstore.mapper;

import com.haui.techstore.dto.ImportDetailDTO;
import com.haui.techstore.dto.ImportOrderDTO;
import com.haui.techstore.entity.ImportDetail;
import com.haui.techstore.entity.ImportOrder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ImportOrderMapper {

    private final ImportDetailMapper importDetailMapper;

    public ImportOrderDTO toDTO(ImportOrder entity) {
        if (entity == null) {
            return null;
        }

        return ImportOrderDTO.builder()
                .id(entity.getId())
                .supplierId(entity.getSupplier().getId())
                .supplierName(entity.getSupplier().getName())
                .importDetails(entity.getImportDetails().stream()
                        .map(importDetailMapper::toDTO)
                        .collect(Collectors.toList()))
                .totalCost(entity.getTotalCost())
                .importDate(entity.getImportDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
