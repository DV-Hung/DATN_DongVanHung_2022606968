package com.haui.techstore.controller;

import com.haui.techstore.dto.ApiResponse;
import com.haui.techstore.dto.CartItemDTO;
import com.haui.techstore.service.CartItemService;
import com.haui.techstore.service.CartSummary;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart Management", description = "APIs for managing shopping cart")
public class CartItemController {

    private final CartItemService cartItemService;

    @PostMapping("/add")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Add product to cart", description = "Add a product variant to user's shopping cart")
    public ResponseEntity<ApiResponse<CartItemDTO>> addToCart(
            @RequestParam Long userId,
            @RequestParam Long variantId,
            @RequestParam(defaultValue = "1") Integer quantity,
            Authentication authentication) {
        validateUserAccess(userId, authentication);
        CartItemDTO cartItem = cartItemService.addToCart(userId, variantId, quantity);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Sản phẩm đã được thêm vào giỏ hàng", cartItem));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user's shopping cart", description = "Retrieve all items in user's shopping cart")
    public ResponseEntity<ApiResponse<List<CartItemDTO>>> getCart(
            @PathVariable Long userId,
            Authentication authentication) {
        validateUserAccess(userId, authentication);
        List<CartItemDTO> cartItems = cartItemService.getCartByUserId(userId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy giỏ hàng thành công", cartItems));
    }

    @GetMapping("/{cartItemId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get cart item details", description = "Retrieve details of a specific cart item")
    public ResponseEntity<ApiResponse<CartItemDTO>> getCartItem(@PathVariable Long cartItemId) {
        CartItemDTO cartItem = cartItemService.getCartItemById(cartItemId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy thông tin giỏ hàng thành công", cartItem));
    }

    @PutMapping("/{cartItemId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update cart item quantity", description = "Update the quantity of a product in the cart")
    public ResponseEntity<ApiResponse<CartItemDTO>> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        CartItemDTO cartItem = cartItemService.updateCartItem(cartItemId, quantity);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Chuật nhật giỏ hàng thành công", cartItem));
    }

    @DeleteMapping("/{cartItemId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Remove item from cart", description = "Remove a specific product from user's shopping cart")
    public ResponseEntity<ApiResponse<Void>> removeFromCart(@PathVariable Long cartItemId) {
        cartItemService.removeFromCart(cartItemId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Sản phẩm đã được xóa khỏi giỏ hàng", null));
    }

    @DeleteMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Clear user's cart", description = "Remove all items from user's shopping cart")
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @PathVariable Long userId,
            Authentication authentication) {
        validateUserAccess(userId, authentication);
        cartItemService.clearCart(userId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Giỏ hàng đã được xóa", null));
    }

    @GetMapping("/user/{userId}/summary")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get cart summary", description = "Get total items count and total price of user's shopping cart")
    public ResponseEntity<ApiResponse<CartSummary>> getCartSummary(
            @PathVariable Long userId,
            Authentication authentication) {
        validateUserAccess(userId, authentication);
        CartSummary summary = cartItemService.getCartSummary(userId);
        return ResponseEntity.ok(
                new ApiResponse<>(200, "Lấy thông tin tóm tắt giỏ hàng thành công", summary));
    }

    /**
     * Xác thực rằng người dùng chỉ có thể truy cập giỏ hàng của chính mình
     * hoặc người dùng là ADMIN
     */
    private void validateUserAccess(Long userId, Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() != null) {
            Object principal = authentication.getPrincipal();
            Long currentUserId = null;

            if (principal instanceof Long) {
                currentUserId = (Long) principal;
            } else if (principal instanceof String) {
                try {
                    currentUserId = Long.parseLong((String) principal);
                } catch (NumberFormatException e) {
                    // Log error if needed
                }
            }

            // Check if user is ADMIN or accessing own cart
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin && (currentUserId == null || !currentUserId.equals(userId))) {
                throw new IllegalArgumentException("Bạn không có quyền truy cập giỏ hàng này");
            }
        }
    }
}
