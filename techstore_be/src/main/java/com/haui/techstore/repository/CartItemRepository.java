package com.haui.techstore.repository;

import com.haui.techstore.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);

    void deleteByUserId(Long userId);

    @Query("DELETE FROM CartItem ci WHERE ci.user.id = :userId")
    void clearUserCart(@Param("userId") Long userId);

    @Query("SELECT ci FROM CartItem ci WHERE ci.user.id = :userId AND ci.variant.id = :variantId")
    CartItem findByUserIdAndVariantId(@Param("userId") Long userId, @Param("variantId") Long variantId);
}
