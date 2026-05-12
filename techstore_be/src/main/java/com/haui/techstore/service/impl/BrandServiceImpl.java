package com.haui.techstore.service.impl;

import com.haui.techstore.dto.BrandDTO;
import com.haui.techstore.entity.Brand;
import com.haui.techstore.exception.BadRequestException;
import com.haui.techstore.exception.ResourceNotFoundException;
import com.haui.techstore.mapper.BrandMapper;
import com.haui.techstore.repository.BrandRepository;
import com.haui.techstore.repository.ProductRepository;
import com.haui.techstore.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final BrandMapper brandMapper;

    @Override
    @Transactional(readOnly = true)
    public BrandDTO getById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));
        return brandMapper.toDTO(brand);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BrandDTO> getAll() {
        return brandRepository.findAll()
                .stream()
                .map(brandMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BrandDTO create(BrandDTO dto) {
        // Check if brand already exists
        if (brandRepository.findByName(dto.getName()).isPresent()) {
            throw new BadRequestException("Brand name '" + dto.getName() + "' already exists");
        }

        Brand entity = brandMapper.toEntity(dto);
        Brand savedEntity = brandRepository.save(entity);

        return brandMapper.toDTO(savedEntity);
    }

    @Override
    public BrandDTO update(Long id, BrandDTO dto) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));

        // Check if new name already exists (and it's not the same brand)
        if (!brand.getName().equals(dto.getName()) &&
                brandRepository.findByName(dto.getName()).isPresent()) {
            throw new BadRequestException("Brand name '" + dto.getName() + "' already exists");
        }

        brand.setName(dto.getName());
        brand.setDescription(dto.getDescription());
        brand.setLogoUrl(dto.getLogoUrl());

        Brand updatedBrand = brandRepository.save(brand);
        return brandMapper.toDTO(updatedBrand);
    }

    @Override
    public void delete(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));

        // Check if any products are using this brand
        long productCount = productRepository.countByBrandId(id);
        if (productCount > 0) {
            throw new BadRequestException(
                    "Không thể xóa nhãn hàng này. Có " + productCount
                            + " sản phẩm đang sử dụng nhãn hàng này.");
        }

        brandRepository.delete(brand);
    }
}
