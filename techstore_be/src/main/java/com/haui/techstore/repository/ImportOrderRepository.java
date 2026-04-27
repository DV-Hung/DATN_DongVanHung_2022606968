package com.haui.techstore.repository;

import com.haui.techstore.entity.ImportOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ImportOrderRepository extends JpaRepository<ImportOrder, Long> {
    Page<ImportOrder> findBySupplierId(Long supplierId, Pageable pageable);

    Page<ImportOrder> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT io FROM ImportOrder io WHERE io.importDate BETWEEN :startDate AND :endDate")
    Page<ImportOrder> findByDateRange(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
}
