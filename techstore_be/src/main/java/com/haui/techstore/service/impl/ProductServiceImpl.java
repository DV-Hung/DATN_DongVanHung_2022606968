package com.haui.techstore.service.impl;

import com.haui.techstore.dto.ProductDTO;
import com.haui.techstore.dto.ProductVariantDTO;
import com.haui.techstore.entity.Brand;
import com.haui.techstore.entity.Category;
import com.haui.techstore.entity.Product;
import com.haui.techstore.entity.ProductVariant;
import com.haui.techstore.entity.Supplier;
import com.haui.techstore.exception.BadRequestException;
import com.haui.techstore.exception.ResourceNotFoundException;
import com.haui.techstore.mapper.ProductMapper;
import com.haui.techstore.mapper.ProductVariantMapper;
import com.haui.techstore.repository.BrandRepository;
import com.haui.techstore.repository.CategoryRepository;
import com.haui.techstore.repository.ImportDetailRepository;
import com.haui.techstore.repository.OrderItemRepository;
import com.haui.techstore.repository.ProductRepository;
import com.haui.techstore.repository.ProductVariantRepository;
import com.haui.techstore.repository.SupplierRepository;
import com.haui.techstore.service.ProductService;
import com.haui.techstore.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final OrderItemRepository orderItemRepository;
    private final ImportDetailRepository importDetailRepository;
    private final ProductMapper productMapper;
    private final ProductVariantMapper productVariantMapper;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final SupplierRepository supplierRepository;

    @Override
    @Transactional(readOnly = true)
    public ProductDTO getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return productMapper.toDTO(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getAll() {
        return productRepository.findAll()
                .stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> getAllPaginated(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(productMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> searchByName(String name, Pageable pageable) {
        return productRepository.findByNameContainingIgnoreCase(name, pageable)
                .map(productMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> filterByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategory(categoryId, pageable)
                .map(productMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> filterByBrand(Long brandId, Pageable pageable) {
        return productRepository.findByBrand(brandId, pageable)
                .map(productMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> filterByCategoryWithOptions(Long categoryId, Double minPrice, Double maxPrice,
            List<String> brandNames, String name, String sortBy, Pageable pageable) {
        // Convert brand names to lowercase for case-insensitive comparison
        List<String> lowerCaseBrandNames = brandNames != null && !brandNames.isEmpty()
                ? brandNames.stream().map(String::toLowerCase).collect(Collectors.toList())
                : null;

        // Build specification for dynamic query filtering
        Specification<Product> spec = ProductSpecification.combineFilters(
                categoryId, minPrice, maxPrice, lowerCaseBrandNames, name, sortBy);

        // Fetch all products with filters (we'll handle sorting in memory)
        List<Product> allProducts = productRepository.findAll(spec);

        // Apply sorting if specified
        if (sortBy != null && !sortBy.isEmpty()) {
            allProducts.sort((p1, p2) -> {
                // Get minimum price for each product from variants
                Double price1 = p1.getVariants() != null && !p1.getVariants().isEmpty()
                        ? p1.getVariants().stream()
                                .mapToDouble(v -> v.getPrice() != null ? v.getPrice().doubleValue() : 0.0)
                                .min().orElse(0.0)
                        : 0.0;

                Double price2 = p2.getVariants() != null && !p2.getVariants().isEmpty()
                        ? p2.getVariants().stream()
                                .mapToDouble(v -> v.getPrice() != null ? v.getPrice().doubleValue() : 0.0)
                                .min().orElse(0.0)
                        : 0.0;

                switch (sortBy) {
                    case "price-low":
                        return Double.compare(price1, price2);
                    case "price-high":
                        return Double.compare(price2, price1);
                    default:
                        return 0;
                }
            });
        }

        // Convert to DTOs
        List<ProductDTO> dtos = allProducts.stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());

        // Apply pagination manually
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), dtos.size());

        List<ProductDTO> pageContent = dtos.subList(start, end);
        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, dtos.size());
    }

    @Override
    public ProductDTO create(ProductDTO dto) {
        // Validate required relationships
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));

        Brand brand = brandRepository.findById(dto.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", dto.getBrandId()));

        // Create product entity
        Product product = new Product();
        product.setName(dto.getName());
        product.setSku(dto.getSku());
        product.setDescription(dto.getDescription());
        product.setCategory(category);
        product.setBrand(brand);

        Product savedProduct = productRepository.save(product);

        // Handle variant creation
        if (dto.getVariants() != null && !dto.getVariants().isEmpty()) {
            for (ProductVariantDTO variantDTO : dto.getVariants()) {
                ProductVariant variant = new ProductVariant();
                variant.setProduct(savedProduct);
                variant.setColor(variantDTO.getColor());
                variant.setRom(variantDTO.getRom());
                variant.setPrice(variantDTO.getPrice());
                variant.setStockQuantity(variantDTO.getStockQuantity());
                variant.setImageUrl(variantDTO.getImageUrl());
                productVariantRepository.save(variant);
            }
        } else if (dto.getDefaultPrice() != null && dto.getDefaultStockQuantity() != null) {
            // Create a default variant if only default price/quantity is provided
            ProductVariant defaultVariant = new ProductVariant();
            defaultVariant.setProduct(savedProduct);
            defaultVariant.setPrice(dto.getDefaultPrice());
            defaultVariant.setStockQuantity(dto.getDefaultStockQuantity());
            productVariantRepository.save(defaultVariant);
        }

        return productMapper.toDTO(savedProduct);
    }

    @Override
    public ProductDTO update(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // Validate and set category if provided
        if (dto.getCategoryId() != null && !dto.getCategoryId().equals(product.getCategory().getId())) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));
            product.setCategory(category);
        }

        // Validate and set brand if provided
        if (dto.getBrandId() != null && !dto.getBrandId().equals(product.getBrand().getId())) {
            Brand brand = brandRepository.findById(dto.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", dto.getBrandId()));
            product.setBrand(brand);
        }

        // Update basic fields
        if (dto.getName() != null && !dto.getName().isEmpty()) {
            product.setName(dto.getName());
        }

        if (dto.getSku() != null && !dto.getSku().isEmpty()) {
            product.setSku(dto.getSku());
        }

        if (dto.getDescription() != null) {
            product.setDescription(dto.getDescription());
        }

        Product updatedProduct = productRepository.save(product);

        // Handle variant updates
        if (dto.getVariants() != null && !dto.getVariants().isEmpty()) {
            // Delete existing variants and create new ones
            List<ProductVariant> existingVariants = updatedProduct.getVariants();
            if (existingVariants != null && !existingVariants.isEmpty()) {
                productVariantRepository.deleteAll(existingVariants);
            }

            // Create new variants
            for (ProductVariantDTO variantDTO : dto.getVariants()) {
                ProductVariant variant = new ProductVariant();
                variant.setProduct(updatedProduct);
                variant.setColor(variantDTO.getColor());
                variant.setRom(variantDTO.getRom());
                variant.setPrice(variantDTO.getPrice());
                variant.setStockQuantity(variantDTO.getStockQuantity());
                variant.setImageUrl(variantDTO.getImageUrl());
                productVariantRepository.save(variant);
            }
        } else if (dto.getDefaultPrice() != null || dto.getDefaultStockQuantity() != null) {
            // Update default variant information on all existing variants
            List<ProductVariant> variants = updatedProduct.getVariants();
            if (variants != null && !variants.isEmpty()) {
                for (ProductVariant variant : variants) {
                    if (dto.getDefaultPrice() != null) {
                        variant.setPrice(dto.getDefaultPrice());
                    }
                    if (dto.getDefaultStockQuantity() != null) {
                        variant.setStockQuantity(dto.getDefaultStockQuantity());
                    }
                    productVariantRepository.save(variant);
                }
            }
        }

        return productMapper.toDTO(updatedProduct);
    }

    @Override
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // Get all variants of the product
        List<ProductVariant> variants = productVariantRepository.findByProductId(id);

        // Check if any variant is used in orders
        for (ProductVariant variant : variants) {
            long orderCount = orderItemRepository.findByVariantId(variant.getId()).size();
            if (orderCount > 0) {
                throw new BadRequestException(
                        "Không thể xóa sản phẩm. Có đơn hàng đang sử dụng sản phẩm này.");
            }
        }

        // Check if any variant is used in imports
        for (ProductVariant variant : variants) {
            long importCount = importDetailRepository.findByVariantId(variant.getId()).size();
            if (importCount > 0) {
                throw new BadRequestException(
                        "Không thể xóa sản phẩm. Có đơn nhập hàng đang sử dụng sản phẩm này.");
            }
        }

        for (ProductVariant variant : variants) {
            long quantity = 0;
            quantity += variant.getStockQuantity();
            if (quantity > 0) {
                throw new BadRequestException(
                        "Không thể xóa sản phẩm. Vẫn còn sản phẩm trong kho.");
            }
        }
        // If no references found, delete all variants first and then the product
        if (!variants.isEmpty()) {
            productVariantRepository.deleteAll(variants);
        }

        productRepository.delete(product);
    }

    @Override
    public Long getTotalProductsCount() {
        return productRepository.count();
    }
}
