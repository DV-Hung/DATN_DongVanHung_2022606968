package com.haui.techstore.service;

import com.haui.techstore.dto.ProductVariantDTO;
import com.haui.techstore.dto.ProductDTO;
import java.util.List;

public interface ProductVariantService {
    ProductVariantDTO getById(Long id);

    List<ProductVariantDTO> getByProductId(Long productId);

    List<ProductVariantDTO> getAvailableVariantsByProductId(Long productId);

    ProductVariantDTO create(ProductVariantDTO dto);

    ProductVariantDTO update(Long id, ProductVariantDTO dto);

    ProductVariantDTO updateStock(Long id, Integer quantity);

    ProductDTO getProductByVariantId(Long variantId);

    void delete(Long id);
}
