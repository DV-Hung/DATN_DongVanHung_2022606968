package com.haui.techstore.service.impl;

import com.haui.techstore.dto.CategoryDTO;
import com.haui.techstore.entity.Category;
import com.haui.techstore.exception.BadRequestException;
import com.haui.techstore.exception.ResourceNotFoundException;
import com.haui.techstore.mapper.CategoryMapper;
import com.haui.techstore.repository.CategoryRepository;
import com.haui.techstore.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {
    
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    
    @Override
    @Transactional(readOnly = true)
    public CategoryDTO getById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return categoryMapper.toDTO(category);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CategoryDTO> getAll() {
        return categoryRepository.findAll()
                .stream()
                .map(categoryMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public CategoryDTO create(CategoryDTO dto) {
        // Check if category already exists
        if (categoryRepository.findByName(dto.getName()).isPresent()) {
            throw new BadRequestException("Category name '" + dto.getName() + "' already exists");
        }
        
        Category entity = categoryMapper.toEntity(dto);
        Category savedEntity = categoryRepository.save(entity);
        
        return categoryMapper.toDTO(savedEntity);
    }
    
    @Override
    public CategoryDTO update(Long id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        
        // Check if new name already exists (and it's not the same category)
        if (!category.getName().equals(dto.getName()) && 
            categoryRepository.findByName(dto.getName()).isPresent()) {
            throw new BadRequestException("Category name '" + dto.getName() + "' already exists");
        }
        
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setSlug(dto.getSlug());
        if (dto.getIsActive() != null) {
            category.setIsActive(dto.getIsActive());
        }
        
        Category updatedCategory = categoryRepository.save(category);
        return categoryMapper.toDTO(updatedCategory);
    }
    
    @Override
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category);
    }
}
