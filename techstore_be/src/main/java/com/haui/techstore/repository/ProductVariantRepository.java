package com.haui.techstore.repository;

import com.haui.techstore.entity.ProductVariant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductId(Long productId);

    long countByProductId(Long productId);

    Optional<ProductVariant> findByRomAndColor(String rom, String color);

    Optional<ProductVariant> findByProductIdAndRomAndColor(Long productId, String rom, String color);

    @Query("SELECT pv FROM ProductVariant pv WHERE pv.stockQuantity > 0 AND pv.product.id = :productId")
    List<ProductVariant> findAvailableVariants(@Param("productId") Long productId);

    @Query("SELECT pv FROM ProductVariant pv WHERE pv.stockQuantity <= :threshold")
    Page<ProductVariant> findLowStockVariants(@Param("threshold") Integer threshold, Pageable pageable);
}
