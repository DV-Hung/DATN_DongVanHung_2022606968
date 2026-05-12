package com.haui.techstore.service.impl;

import com.haui.techstore.dto.SupplierDTO;
import com.haui.techstore.entity.ImportOrder;
import com.haui.techstore.entity.ProductVariant;
import com.haui.techstore.entity.Supplier;
import com.haui.techstore.exception.BadRequestException;
import com.haui.techstore.exception.ResourceNotFoundException;
import com.haui.techstore.mapper.SupplierMapper;
import com.haui.techstore.repository.ImportOrderRepository;
import com.haui.techstore.repository.SupplierRepository;
import com.haui.techstore.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;
    private final ImportOrderRepository importOrderRepository;

    @Override
    @Transactional(readOnly = true)
    public SupplierDTO getById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        return supplierMapper.toDTO(supplier);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierDTO> getAll() {
        return supplierRepository.findAll()
                .stream()
                .map(supplierMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SupplierDTO create(SupplierDTO dto) {
        // Check if supplier already exists
        if (supplierRepository.findByName(dto.getName()).isPresent()) {
            throw new BadRequestException("Supplier name '" + dto.getName() + "' already exists");
        }

        Supplier entity = supplierMapper.toEntity(dto);
        Supplier savedEntity = supplierRepository.save(entity);

        return supplierMapper.toDTO(savedEntity);
    }

    @Override
    public SupplierDTO update(Long id, SupplierDTO dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));

        // Check if new name already exists (and it's not the same supplier)
        if (!supplier.getName().equals(dto.getName()) &&
                supplierRepository.findByName(dto.getName()).isPresent()) {
            throw new BadRequestException("Supplier name '" + dto.getName() + "' already exists");
        }

        supplier.setName(dto.getName());
        supplier.setPhone(dto.getPhone());
        supplier.setAddress(dto.getAddress());
        supplier.setEmail(dto.getEmail());
        if (dto.getIsActive() != null) {
            supplier.setIsActive(dto.getIsActive());
        }

        Supplier updatedSupplier = supplierRepository.save(supplier);
        return supplierMapper.toDTO(updatedSupplier);
    }

    @Override
    public void delete(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));

        // Get all import orders of the supplier
        List<ImportOrder> importOrders = importOrderRepository.findBySupplierId(id);

        // Check if any importOrder is used in orders
        if (importOrders.size() > 0) {
            throw new BadRequestException("Không thể xóa nhà cung cấp đã có đơn nhập");
        }
        // Set supplier to inactive instead of deleting

        supplierRepository.delete(supplier);
    }
}
