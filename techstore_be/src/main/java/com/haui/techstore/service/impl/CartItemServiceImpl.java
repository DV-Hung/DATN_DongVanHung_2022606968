package com.haui.techstore.service.impl;

import com.haui.techstore.dto.CartItemDTO;
import com.haui.techstore.entity.CartItem;
import com.haui.techstore.entity.ProductVariant;
import com.haui.techstore.entity.User;
import com.haui.techstore.exception.BadRequestException;
import com.haui.techstore.exception.ResourceNotFoundException;
import com.haui.techstore.mapper.CartItemMapper;
import com.haui.techstore.repository.CartItemRepository;
import com.haui.techstore.repository.ProductVariantRepository;
import com.haui.techstore.repository.UserRepository;
import com.haui.techstore.service.CartItemService;
import com.haui.techstore.service.CartSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartItemServiceImpl implements CartItemService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CartItemMapper cartItemMapper;

    @Override
    public CartItemDTO addToCart(Long userId, Long variantId, Integer quantity) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Validate variant exists
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", variantId));

        // Validate quantity
        if (quantity <= 0) {
            throw new BadRequestException("Số lượng phải lớn hơn 0");
        }

        // Check stock availability
        if (variant.getStockQuantity() < quantity) {
            throw new BadRequestException("Không đủ hàng trong kho. Số lượng tồn kho: " + variant.getStockQuantity());
        }

        // Check if item already in cart
        CartItem cartItem = cartItemRepository.findByUserIdAndVariantId(userId, variantId);

        if (cartItem != null) {
            // Update quantity if already exists
            int newQuantity = cartItem.getQuantity() + quantity;

            if (variant.getStockQuantity() < newQuantity) {
                throw new BadRequestException(
                        "Không đủ hàng trong kho. Số lượng tồn kho: " + variant.getStockQuantity());
            }

            cartItem.setQuantity(newQuantity);
            cartItem = cartItemRepository.save(cartItem);
        } else {
            // Create new cart item
            cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setVariant(variant);
            cartItem.setQuantity(quantity);
            cartItem = cartItemRepository.save(cartItem);
        }

        return cartItemMapper.toDTO(cartItem);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CartItemDTO> getCartByUserId(Long userId) {
        // Validate user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }

        return cartItemRepository.findByUserId(userId)
                .stream()
                .map(cartItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CartItemDTO updateCartItem(Long cartItemId, Integer quantity) {
        // Validate cart item exists
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        // Validate quantity
        if (quantity <= 0) {
            throw new BadRequestException("Số lượng phải lớn hơn 0");
        }

        // Check stock availability
        if (cartItem.getVariant().getStockQuantity() < quantity) {
            throw new BadRequestException(
                    "Không đủ hàng trong kho. Số lượng tồn kho: " + cartItem.getVariant().getStockQuantity());
        }

        cartItem.setQuantity(quantity);
        cartItem = cartItemRepository.save(cartItem);

        return cartItemMapper.toDTO(cartItem);
    }

    @Override
    public void removeFromCart(Long cartItemId) {
        // Validate cart item exists
        if (!cartItemRepository.existsById(cartItemId)) {
            throw new ResourceNotFoundException("CartItem", "id", cartItemId);
        }

        cartItemRepository.deleteById(cartItemId);
    }

    @Override
    public void clearCart(Long userId) {
        // Validate user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }

        cartItemRepository.deleteByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public CartItemDTO getCartItemById(Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        return cartItemMapper.toDTO(cartItem);
    }

    @Override
    @Transactional(readOnly = true)
    public CartSummary getCartSummary(Long userId) {
        // Validate user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }

        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);

        int totalItems = cartItems.size();
        BigDecimal totalPrice = cartItems.stream()
                .map(item -> item.getVariant().getPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartSummary.builder()
                .userId(userId)
                .totalItems(totalItems)
                .totalPrice(totalPrice)
                .build();
    }
}
