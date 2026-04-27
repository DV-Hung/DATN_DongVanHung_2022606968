package com.haui.techstore.service.impl;

import com.haui.techstore.dto.ImportDetailDTO;
import com.haui.techstore.dto.ImportOrderDTO;
import com.haui.techstore.entity.*;
import com.haui.techstore.exception.BadRequestException;
import com.haui.techstore.exception.ResourceNotFoundException;
import com.haui.techstore.mapper.ImportDetailMapper;
import com.haui.techstore.mapper.ImportOrderMapper;
import com.haui.techstore.repository.*;
import com.haui.techstore.service.ImportOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ImportOrderServiceImpl implements ImportOrderService {

    private final ImportOrderRepository importOrderRepository;
    private final ImportDetailRepository importDetailRepository;
    private final ProductVariantRepository productVariantRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final ImportOrderMapper importOrderMapper;
    private final ImportDetailMapper importDetailMapper;

    // Markup percentage for selling price (25%)
    private static final BigDecimal MARKUP_PERCENTAGE = new BigDecimal("0.25");

    @Override
    public ImportOrderDTO createImportOrder(ImportOrderDTO dto, Long userId) {
        // Validate supplier exists
        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", dto.getSupplierId()));

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Validate import details
        if (dto.getImportDetails() == null || dto.getImportDetails().isEmpty()) {
            throw new BadRequestException("Import details cannot be empty");
        }

        // Create import order
        ImportOrder importOrder = new ImportOrder();
        importOrder.setSupplier(supplier);
        importOrder.setUser(user);
        importOrder.setImportDate(LocalDateTime.now());
        importOrder.setImportDetails(new ArrayList<>());

        BigDecimal totalCost = BigDecimal.ZERO;

        // Process each import detail
        for (ImportDetailDTO detailDTO : dto.getImportDetails()) {
            // Validate variant exists
            ProductVariant variant = productVariantRepository.findById(detailDTO.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", detailDTO.getVariantId()));

            // Validate quantity
            if (detailDTO.getQuantity() <= 0) {
                throw new BadRequestException("Quantity must be greater than 0");
            }

            // Create import detail
            ImportDetail importDetail = new ImportDetail();
            importDetail.setVariant(variant);
            importDetail.setQuantity(detailDTO.getQuantity());
            importDetail.setImportPrice(detailDTO.getImportPrice());
            importDetail.setImportOrder(importOrder);

            // Update variant stock quantity
            Integer newStock = variant.getStockQuantity() + detailDTO.getQuantity();
            variant.setStockQuantity(newStock);

            // Calculate and update selling price (25% markup, rounded to nearest 10,000)
            BigDecimal sellingPrice = calculateSellingPrice(detailDTO.getImportPrice());
            variant.setPrice(sellingPrice);

            // Save variant with updated stock and price
            productVariantRepository.save(variant);

            // Add detail to order
            importOrder.getImportDetails().add(importDetail);
            // importDetailRepository.save(importDetail);

            // Add to total cost
            BigDecimal detailCost = detailDTO.getImportPrice().multiply(new BigDecimal(detailDTO.getQuantity()));
            totalCost = totalCost.add(detailCost);
        }

        // Set total cost
        importOrder.setTotalCost(totalCost);

        // Save and return
        ImportOrder savedOrder = importOrderRepository.save(importOrder);
        return importOrderMapper.toDTO(savedOrder);
    }

    /**
     * Calculate selling price with 25% markup, rounded to nearest 10,000
     * Formula: sellingPrice = importPrice * 1.25, rounded to nearest 10,000
     */
    private BigDecimal calculateSellingPrice(BigDecimal importPrice) {
        // Calculate with 25% markup
        BigDecimal priceWithMarkup = importPrice.multiply(BigDecimal.ONE.add(MARKUP_PERCENTAGE));

        // Round to nearest 10,000
        BigDecimal divisor = new BigDecimal("10000");
        BigDecimal divided = priceWithMarkup.divide(divisor, 0, RoundingMode.HALF_UP);
        return divided.multiply(divisor);
    }

    @Override
    @Transactional(readOnly = true)
    public ImportOrderDTO getById(Long id) {
        ImportOrder importOrder = importOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ImportOrder", "id", id));
        return importOrderMapper.toDTO(importOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ImportOrderDTO> getBySupplierId(Long supplierId) {
        supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", supplierId));

        return importOrderRepository.findBySupplierId(supplierId, org.springframework.data.domain.Pageable.ofSize(1000))
                .stream()
                .map(importOrderMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ImportOrderDTO> getByUserId(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return importOrderRepository.findByUserId(userId, org.springframework.data.domain.Pageable.ofSize(1000))
                .stream()
                .map(importOrderMapper::toDTO)
                .collect(Collectors.toList());
    }
}
