package com.haui.techstore.service.impl;

import com.haui.techstore.dto.ProductVariantDTO;
import com.haui.techstore.dto.ProductDTO;
import com.haui.techstore.entity.Product;
import com.haui.techstore.entity.ProductVariant;
import com.haui.techstore.exception.BadRequestException;
import com.haui.techstore.exception.ResourceNotFoundException;
import com.haui.techstore.mapper.ProductVariantMapper;
import com.haui.techstore.mapper.ProductMapper;
import com.haui.techstore.repository.ImportDetailRepository;
import com.haui.techstore.repository.OrderItemRepository;
import com.haui.techstore.repository.ProductRepository;
import com.haui.techstore.repository.ProductVariantRepository;
import com.haui.techstore.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final ImportDetailRepository importDetailRepository;
    private final ProductVariantMapper variantMapper;
    private final ProductMapper productMapper;

    @Override
    @Transactional(readOnly = true)
    public ProductVariantDTO getById(Long id) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id));
        return variantMapper.toDTO(variant);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariantDTO> getByProductId(Long productId) {
        // Verify product exists
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        return variantRepository.findByProductId(productId)
                .stream()
                .map(variantMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariantDTO> getAvailableVariantsByProductId(Long productId) {
        // Verify product exists
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        return variantRepository.findAvailableVariants(productId)
                .stream()
                .map(variantMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductVariantDTO create(ProductVariantDTO dto) {
        // Validate product exists
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", dto.getProductId()));

        // Check if variant with same color and rom already exists for this product
        if (variantRepository.findByProductIdAndRomAndColor(dto.getProductId(), dto.getRom(), dto.getColor())
                .isPresent()) {
            throw new BadRequestException(
                    "Product variant with ROM '" + dto.getRom() + "' and color '" + dto.getColor()
                            + "' already exists for this product");
        }

        // Create variant entity
        ProductVariant variant = new ProductVariant();
        variant.setColor(dto.getColor());
        variant.setRom(dto.getRom());
        variant.setPrice(dto.getPrice());
        variant.setStockQuantity(dto.getStockQuantity());
        variant.setImageUrl(dto.getImageUrl());
        variant.setProduct(product);

        ProductVariant savedVariant = variantRepository.save(variant);
        return variantMapper.toDTO(savedVariant);
    }

    @Override
    public ProductVariantDTO update(Long id, ProductVariantDTO dto) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id));

        // If color or rom is being changed, check for uniqueness
        String newColor = dto.getColor() != null ? dto.getColor() : variant.getColor();
        String newRom = dto.getRom() != null ? dto.getRom() : variant.getRom();

        if ((dto.getColor() != null && !dto.getColor().equals(variant.getColor())) ||
                (dto.getRom() != null && !dto.getRom().equals(variant.getRom()))) {
            if (variantRepository.findByProductIdAndRomAndColor(variant.getProduct().getId(), newRom, newColor)
                    .isPresent()) {
                throw new BadRequestException(
                        "Product variant with ROM '" + newRom + "' and color '" + newColor
                                + "' already exists for this product");
            }
        }

        // Update fields
        if (dto.getRom() != null) {
            variant.setRom(dto.getRom());
        }

        if (dto.getColor() != null) {
            variant.setColor(dto.getColor());
        }

        if (dto.getPrice() != null) {
            variant.setPrice(dto.getPrice());
        }

        if (dto.getStockQuantity() != null) {
            variant.setStockQuantity(dto.getStockQuantity());
        }

        if (dto.getImageUrl() != null) {
            variant.setImageUrl(dto.getImageUrl());
        }

        ProductVariant updatedVariant = variantRepository.save(variant);
        return variantMapper.toDTO(updatedVariant);
    }

    @Override
    public ProductVariantDTO updateStock(Long id, Integer quantity) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id));

        if (quantity < 0) {
            throw new BadRequestException("Stock quantity must be non-negative");
        }

        variant.setStockQuantity(quantity);
        ProductVariant updatedVariant = variantRepository.save(variant);
        return variantMapper.toDTO(updatedVariant);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO getProductByVariantId(Long variantId) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", variantId));

        Product product = variant.getProduct();
        return productMapper.toDTO(product);
    }

    @Override
    public void delete(Long id) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id));

        // Check if variant is used in orders
        long orderCount = orderItemRepository.findByVariantId(id).size();
        if (orderCount > 0) {
            throw new BadRequestException(
                    "Không thể xóa phiên bản này. Có đơn hàng đang sử dụng phiên bản này. ");
        }
        // Check if variant is used in imports
        long importCount = importDetailRepository.findByVariantId(id).size();
        if (importCount > 0) {
            throw new BadRequestException(
                    "Không thể xóa phiên bản này. Có đơn nhập hàng đang sử dụng phiên bản này.");
        }

        if (variant.getStockQuantity() > 0) {
            throw new BadRequestException(
                    "Không thể xóa phiên bản này. Vẫn còn tồn kho.");
        }
        // If no references found, delete the variant
        variantRepository.delete(variant);
    }

}
