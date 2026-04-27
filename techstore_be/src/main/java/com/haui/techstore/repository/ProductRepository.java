package com.haui.techstore.repository;

import com.haui.techstore.entity.Product;
import com.haui.techstore.entity.Category;
import com.haui.techstore.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
        @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.variants WHERE p.id = :id")
        Optional<Product> findById(@Param("id") Long id);

        @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.variants")
        List<Product> findAll();

        @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.variants WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
        Page<Product> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);

        @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.variants")
        Page<Product> findAll(Pageable pageable);

        @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.variants WHERE p.category.id = :categoryId")
        Page<Product> findByCategory(@Param("categoryId") Long categoryId, Pageable pageable);

        @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.variants WHERE p.brand.id = :brandId")
        Page<Product> findByBrand(@Param("brandId") Long brandId, Pageable pageable);

        @Query("SELECT COUNT(p) FROM Product p WHERE p.brand.id = :brandId")
        long countByBrandId(@Param("brandId") Long brandId);
}
