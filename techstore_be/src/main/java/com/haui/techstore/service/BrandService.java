package com.haui.techstore.service;

import com.haui.techstore.dto.BrandDTO;
import java.util.List;

public interface BrandService {
    BrandDTO getById(Long id);
    List<BrandDTO> getAll();
    BrandDTO create(BrandDTO dto);
    BrandDTO update(Long id, BrandDTO dto);
    void delete(Long id);
}
