package com.haui.techstore.repository;

import com.haui.techstore.entity.ImportDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportDetailRepository extends JpaRepository<ImportDetail, Long> {
    List<ImportDetail> findByImportOrderId(Long importOrderId);

    List<ImportDetail> findByVariantId(Long variantId);
}
