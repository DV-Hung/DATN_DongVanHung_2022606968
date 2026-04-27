package com.haui.techstore.service;

import com.haui.techstore.dto.ImportDetailDTO;
import com.haui.techstore.dto.ImportOrderDTO;

import java.util.List;

public interface ImportOrderService {

    ImportOrderDTO createImportOrder(ImportOrderDTO dto, Long userId);

    ImportOrderDTO getById(Long id);

    List<ImportOrderDTO> getBySupplierId(Long supplierId);

    List<ImportOrderDTO> getByUserId(Long userId);
}
