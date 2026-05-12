package com.haui.techstore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemLogsDTO {
    private Long id;

    private String action;

    private String targetTable;

    private Long targetId;

    private String oldValue;

    private String newValue;

    private LocalDateTime createdAt;

    private Long userId;

    private String userName;
}
