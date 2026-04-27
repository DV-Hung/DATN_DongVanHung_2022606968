package com.haui.techstore.mapper;

import com.haui.techstore.dto.UserDTO;
import com.haui.techstore.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDTO toDTO(User entity) {
        if (entity == null) {
            return null;
        }

        return UserDTO.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .fullName(entity.getFullName())
                .role(entity.getRole())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public User toEntity(UserDTO dto) {
        if (dto == null) {
            return null;
        }

        User entity = new User();
        entity.setId(dto.getId());
        entity.setEmail(dto.getEmail());
        entity.setPassword(dto.getPassword());
        entity.setFullName(dto.getFullName());
        entity.setPhone(dto.getPhone());
        entity.setAddress(dto.getAddress());
        entity.setRole(dto.getRole());
        entity.setStatus(dto.getStatus());

        return entity;
    }
}
