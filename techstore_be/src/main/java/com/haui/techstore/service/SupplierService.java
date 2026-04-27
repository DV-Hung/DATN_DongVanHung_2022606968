package com.haui.techstore.service;

import com.haui.techstore.dto.SupplierDTO;
import java.util.List;

public interface SupplierService {
    SupplierDTO getById(Long id);
    List<SupplierDTO> getAll();
    SupplierDTO create(SupplierDTO dto);
    SupplierDTO update(Long id, SupplierDTO dto);
    void delete(Long id);
}
