package com.haui.techstore.service;

import com.haui.techstore.dto.CategoryDTO;
import java.util.List;

public interface CategoryService {
    CategoryDTO getById(Long id);
    List<CategoryDTO> getAll();
    CategoryDTO create(CategoryDTO dto);
    CategoryDTO update(Long id, CategoryDTO dto);
    void delete(Long id);
}
