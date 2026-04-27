package com.haui.techstore.service.impl;

import com.haui.techstore.dto.OrderDTO;
import com.haui.techstore.dto.OrderItemDTO;
import com.haui.techstore.entity.*;
import com.haui.techstore.exception.BadRequestException;
import com.haui.techstore.exception.ResourceNotFoundException;
import com.haui.techstore.mapper.OrderItemMapper;
import com.haui.techstore.mapper.OrderMapper;
import com.haui.techstore.repository.*;
import com.haui.techstore.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;
    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;

    @Override
    public OrderDTO createOrderFromCart(Long userId, OrderDTO orderDTO) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Get cart items
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi tạo đơn hàng");
        }

        // Validate all variants exist and have enough stock
        for (CartItem cartItem : cartItems) {
            ProductVariant variant = cartItem.getVariant();
            if (variant.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException(
                        "Sản phẩm '" + variant.getProduct().getName() +
                                "' không đủ hàng. Tồn kho: " + variant.getStockQuantity());
            }
        }

        // Create order with PENDING status
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(orderDTO.getShippingAddress());
        order.setPaymentMethod(orderDTO.getPaymentMethod());
        order.setCustomerName(orderDTO.getCustomerName());
        order.setPhone(orderDTO.getPhone());
        order.setEmail(orderDTO.getEmail());
        order.setStatus("PENDING"); // Set to PENDING
        order.setOrderDate(LocalDateTime.now());

        // Calculate total amount and create order items
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new java.util.ArrayList<>();

        for (CartItem cartItem : cartItems) {
            ProductVariant variant = cartItem.getVariant();

            // Create order item (without updating stock yet)
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setVariant(variant);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(variant.getPrice());

            orderItems.add(orderItem);

            // Calculate total
            totalAmount = totalAmount.add(
                    variant.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        order.setTotalAmount(totalAmount);
        order.setOrderItems(orderItems);

        // Save order and order items
        Order savedOrder = orderRepository.save(order);

        // NOTE: Stock is NOT updated yet since status is PENDING

        // Clear cart after order creation
        cartItemRepository.deleteByUserId(userId);

        return mapOrderWithItems(savedOrder);
    }

    @Override
    public OrderDTO createOrder(Long userId, OrderDTO orderDTO) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Validate orderItems not empty
        if (orderDTO.getOrderItems() == null || orderDTO.getOrderItems().isEmpty()) {
            throw new BadRequestException("Đơn hàng phải có ít nhất một sản phẩm");
        }

        // Validate all variants exist and have enough stock
        for (OrderItemDTO itemDTO : orderDTO.getOrderItems()) {
            ProductVariant variant = productVariantRepository.findById(itemDTO.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", itemDTO.getVariantId()));

            if (variant.getStockQuantity() < itemDTO.getQuantity()) {
                throw new BadRequestException(
                        "Sản phẩm '" + variant.getProduct().getName() +
                                "' không đủ hàng. Tồn kho: " + variant.getStockQuantity());
            }
        }

        // Create order with PENDING status
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(orderDTO.getShippingAddress());
        order.setPaymentMethod(orderDTO.getPaymentMethod());
        order.setCustomerName(orderDTO.getCustomerName());
        order.setPhone(orderDTO.getPhone());
        order.setEmail(orderDTO.getEmail());
        order.setStatus("PENDING"); // Set to PENDING
        order.setOrderDate(LocalDateTime.now());

        // Calculate total amount and create order items
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new java.util.ArrayList<>();

        for (OrderItemDTO itemDTO : orderDTO.getOrderItems()) {
            ProductVariant variant = productVariantRepository.findById(itemDTO.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", itemDTO.getVariantId()));

            // Create order item (without updating stock yet)
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setVariant(variant);
            orderItem.setQuantity(itemDTO.getQuantity());

            // Use priceAtPurchase from client, or fallback to variant price
            BigDecimal price = itemDTO.getPriceAtPurchase() != null
                    ? itemDTO.getPriceAtPurchase()
                    : variant.getPrice();
            orderItem.setPriceAtPurchase(price);

            orderItems.add(orderItem);

            // Calculate total
            totalAmount = totalAmount.add(
                    price.multiply(BigDecimal.valueOf(itemDTO.getQuantity())));
        }

        order.setTotalAmount(totalAmount);
        order.setOrderItems(orderItems);

        // Save order and order items
        Order savedOrder = orderRepository.save(order);

        // NOTE: Stock is NOT updated yet since status is PENDING

        // Do NOT clear cart here since this method handles both direct purchase and
        // cart checkout

        return mapOrderWithItems(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        return mapOrderWithItems(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(this::mapOrderWithItems);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO> getOrdersByUserId(Long userId, Pageable pageable) {
        // Validate user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }

        return orderRepository.findByUserId(userId, pageable)
                .map(this::mapOrderWithItems);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO> getOrdersByStatus(String status, Pageable pageable) {
        validateStatus(status);
        return orderRepository.findByStatus(status, pageable)
                .map(this::mapOrderWithItems);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO> getOrdersByUserIdAndStatus(Long userId, String status, Pageable pageable) {
        // Validate user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }

        validateStatus(status);
        return orderRepository.findByUserIdAndStatus(userId, status, pageable)
                .map(this::mapOrderWithItems);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return orderRepository.findByDateRange(startDate, endDate, pageable)
                .map(this::mapOrderWithItems);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO> searchOrdersByPhoneNumber(String phoneNumber, Pageable pageable) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            throw new BadRequestException("Số điện thoại không được để trống");
        }
        return orderRepository.findByPhoneNumber(phoneNumber.trim(), pageable)
                .map(this::mapOrderWithItems);
    }

    @Override
    public OrderDTO updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        validateStatus(newStatus);

        String currentStatus = order.getStatus();

        // Validate status transition
        validateStatusTransition(currentStatus, newStatus);

        // Handle stock updates based on new status
        if ("CONFIRMED".equals(newStatus)) {
            // Deduct stock when order is confirmed
            updateStockOnConfirmed(order);
        } else if ("CANCELLED".equals(newStatus)) {
            // Restore stock if order was already confirmed (stock was deducted)
            if ("CONFIRMED".equals(currentStatus)) {
                restoreStockOnCancellation(order);
            }
        }

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);

        return mapOrderWithItems(updatedOrder);
    }

    @Override
    public OrderDTO cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Can only delete/cancel PENDING orders. If order is CONFIRMED, must restore
        // stock before deleting
        if ("CONFIRMED".equals(order.getStatus())) {
            // Restore stock before deleting
            restoreStockOnCancellation(order);
        } else if (!"PENDING".equals(order.getStatus())) {
            throw new BadRequestException(
                    "Chỉ có thể xóa đơn hàng ở trạng thái PENDING hoặc CONFIRMED. Đơn hàng hiện tại: "
                            + order.getStatus());
        }

        // Delete the order completely
        orderRepository.deleteById(orderId);

        // Return null or dummy DTO since order is deleted
        return OrderDTO.builder()
                .id(orderId)
                .status("DELETED")
                .build();
    }

    @Override
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Can only delete CANCELLED or PENDING orders
        if (!order.getStatus().equals("CANCELLED") && !order.getStatus().equals("PENDING")) {
            throw new BadRequestException("Chỉ có thể xóa đơn hàng ở trạng thái CANCELLED hoặc PENDING");
        }

        orderRepository.deleteById(orderId);
    }

    /**
     * Update stock when order is confirmed (deduct from inventory)
     */
    private void updateStockOnConfirmed(Order order) {
        for (OrderItem orderItem : order.getOrderItems()) {
            ProductVariant variant = orderItem.getVariant();
            int newStockQuantity = variant.getStockQuantity() - orderItem.getQuantity();

            if (newStockQuantity < 0) {
                throw new BadRequestException(
                        "Không đủ hàng để xác nhận đơn hàng");
            }

            variant.setStockQuantity(newStockQuantity);
            productVariantRepository.save(variant);
        }
    }

    /**
     * Restore stock when order is cancelled after being completed
     */
    private void restoreStockOnCancellation(Order order) {
        for (OrderItem orderItem : order.getOrderItems()) {
            ProductVariant variant = orderItem.getVariant();
            int newStockQuantity = variant.getStockQuantity() + orderItem.getQuantity();

            variant.setStockQuantity(newStockQuantity);
            productVariantRepository.save(variant);
        }
    }

    /**
     * Validate status value
     */
    private void validateStatus(String status) {
        String[] validStatuses = { "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED" };
        boolean isValid = false;
        for (String validStatus : validStatuses) {
            if (validStatus.equals(status)) {
                isValid = true;
                break;
            }
        }

        if (!isValid) {
            throw new BadRequestException("Trạng thái không hợp lệ: " + status);
        }
    }

    /**
     * Validate status transition
     * Allowed: PENDING → CONFIRMED → COMPLETED
     */
    private void validateStatusTransition(String currentStatus, String newStatus) {
        if ("PENDING".equals(currentStatus)) {
            if (!"CONFIRMED".equals(newStatus) && !"CANCELLED".equals(newStatus)) {
                throw new BadRequestException(
                        "Từ trạng thái PENDING chỉ có thể chuyển sang CONFIRMED");
            }
        } else if ("CONFIRMED".equals(currentStatus)) {
            if (!"COMPLETED".equals(newStatus)) {
                throw new BadRequestException(
                        "Từ trạng thái CONFIRMED chỉ có thể chuyển sang COMPLETED");
            }
        } else {
            throw new BadRequestException(
                    "Không thể thay đổi trạng thái từ " + currentStatus + " sang " + newStatus);
        }
    }

    /**
     * Map order entity to DTO with order items
     */
    private OrderDTO mapOrderWithItems(Order order) {
        OrderDTO orderDTO = orderMapper.toDTO(order);

        List<OrderItemDTO> orderItemDTOs = order.getOrderItems().stream()
                .map(orderItemMapper::toDTO)
                .collect(Collectors.toList());

        orderDTO.setOrderItems(orderItemDTOs);
        return orderDTO;
    }
}
