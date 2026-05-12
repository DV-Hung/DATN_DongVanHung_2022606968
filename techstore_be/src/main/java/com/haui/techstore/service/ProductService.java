package com.haui.techstore.service;

import com.haui.techstore.dto.ProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {
    ProductDTO getById(Long id);

    List<ProductDTO> getAll();

    Page<ProductDTO> getAllPaginated(Pageable pageable);

    Page<ProductDTO> searchByName(String name, Pageable pageable);

    Page<ProductDTO> filterByCategory(Long categoryId, Pageable pageable);

    Page<ProductDTO> filterByBrand(Long brandId, Pageable pageable);

    Page<ProductDTO> filterByCategoryWithOptions(Long categoryId, Double minPrice, Double maxPrice,
            List<String> brandNames, String name, String sortBy, Pageable pageable);

    ProductDTO create(ProductDTO dto);

    ProductDTO update(Long id, ProductDTO dto);

    void delete(Long id);

    /**
     * Get total count of products
     */
    Long getTotalProductsCount();
}
