package com.haui.techstore.service;

import com.haui.techstore.dto.CartItemDTO;

import java.util.List;

public interface CartItemService {

    /**
     * Thêm sản phẩm vào giỏ hàng
     */
    CartItemDTO addToCart(Long userId, Long variantId, Integer quantity);

    /**
     * Lấy giỏ hàng của người dùng
     */
    List<CartItemDTO> getCartByUserId(Long userId);

    /**
     * Cập nhật số lượng sản phẩm trong giỏ hàng
     */
    CartItemDTO updateCartItem(Long cartItemId, Integer quantity);

    /**
     * Xóa một sản phẩm khỏi giỏ hàng
     */
    void removeFromCart(Long cartItemId);

    /**
     * Xóa toàn bộ giỏ hàng của người dùng
     */
    void clearCart(Long userId);

    /**
     * Lấy thông tin chi tiết một item trong giỏ hàng
     */
    CartItemDTO getCartItemById(Long cartItemId);

    /**
     * Tính tổng tiền giỏ hàng
     */
    CartSummary getCartSummary(Long userId);
}
