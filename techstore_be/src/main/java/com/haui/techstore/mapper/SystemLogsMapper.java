package com.haui.techstore.mapper;

import com.haui.techstore.dto.SystemLogsDTO;
import com.haui.techstore.entity.SystemLogs;
import org.springframework.stereotype.Component;

@Component
public class SystemLogsMapper {

    public SystemLogsDTO toDTO(SystemLogs entity) {
        if (entity == null) {
            return null;
        }

        return SystemLogsDTO.builder()
                .id(entity.getId())
                .action(entity.getAction())
                .targetTable(entity.getTargetTable())
                .targetId(entity.getTargetId())
                .oldValue(entity.getOldValue())
                .newValue(entity.getNewValue())
                .createdAt(entity.getCreatedAt())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .userName(entity.getUser() != null ? entity.getUser().getFullName() : null)
                .build();
    }

    public SystemLogs toEntity(SystemLogsDTO dto) {
        if (dto == null) {
            return null;
        }

        return SystemLogs.builder()
                .id(dto.getId())
                .action(dto.getAction())
                .targetTable(dto.getTargetTable())
                .targetId(dto.getTargetId())
                .oldValue(dto.getOldValue())
                .newValue(dto.getNewValue())
                .build();
    }
}
