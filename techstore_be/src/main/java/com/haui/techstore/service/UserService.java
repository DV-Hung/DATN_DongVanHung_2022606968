package com.haui.techstore.service;

import com.haui.techstore.dto.UserDTO;
import com.haui.techstore.entity.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    UserDTO getById(Long id);

    UserDTO getByEmail(String email);

    User getByEmailEntity(String email);

    List<UserDTO> getAll();

    Page<UserDTO> getAllPaginated(Pageable pageable);

    Page<UserDTO> searchByEmail(String email, Pageable pageable);

    Page<UserDTO> searchByFullName(String fullName, Pageable pageable);

    UserDTO create(UserDTO dto);

    UserDTO update(Long id, UserDTO dto);

    void delete(Long id);

    void deleteByEmail(String email);

    void updateUserStatus(Long id, String status);

    /**
     * Get total count of users
     */
    Long getTotalUsersCount();
}
