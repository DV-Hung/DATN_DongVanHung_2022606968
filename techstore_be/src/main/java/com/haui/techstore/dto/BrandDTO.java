package com.haui.techstore.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandDTO {
    private Long id;
    
    @NotBlank(message = "Brand name is required")
    private String name;
    
    private String description;
    
    private String logoUrl;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
