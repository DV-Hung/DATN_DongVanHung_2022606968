package com.haui.techstore.controller;

import com.haui.techstore.dto.ApiResponse;
import com.haui.techstore.dto.OrderDTO;
import com.haui.techstore.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order Management", description = "APIs for managing orders")
public class OrderController {

        private final OrderService orderService;

        @GetMapping
        @Operation(summary = "Get all orders", description = "Retrieve all orders with pagination (admin use)")
        public ResponseEntity<ApiResponse<Page<OrderDTO>>> getAllOrders(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<OrderDTO> orders = orderService.getAllOrders(pageable);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Lấy danh sách đơn hàng thành công", orders));
        }

        @PostMapping
        @Operation(summary = "Create order", description = "Create new order with order items and shipping information (supports both direct purchase and cart checkout)")
        public ResponseEntity<ApiResponse<OrderDTO>> createOrder(
                        @RequestParam Long userId,
                        @Valid @RequestBody OrderDTO orderDTO) {
                OrderDTO createdOrder = orderService.createOrder(userId, orderDTO);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(new ApiResponse<>(201, "Đơn hàng đã được tạo với trạng thái PENDING",
                                                createdOrder));
        }

        @GetMapping("/{id}")
        @Operation(summary = "Get order by ID", description = "Retrieve order details by order ID")
        public ResponseEntity<ApiResponse<OrderDTO>> getOrder(@PathVariable Long id) {
                OrderDTO order = orderService.getOrderById(id);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Lấy thông tin đơn hàng thành công", order));
        }

        @GetMapping("/user/{userId}")
        @Operation(summary = "Get user's orders", description = "Retrieve all orders of a specific user")
        public ResponseEntity<ApiResponse<Page<OrderDTO>>> getUserOrders(
                        @PathVariable Long userId,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<OrderDTO> orders = orderService.getOrdersByUserId(userId, pageable);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Lấy danh sách đơn hàng thành công", orders));
        }

        @GetMapping("/status/{status}")
        @Operation(summary = "Get orders by status", description = "Retrieve orders by specific status")
        public ResponseEntity<ApiResponse<Page<OrderDTO>>> getOrdersByStatus(
                        @PathVariable String status,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<OrderDTO> orders = orderService.getOrdersByStatus(status, pageable);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Lấy danh sách đơn hàng thành công", orders));
        }

        @GetMapping("/user/{userId}/status/{status}")
        @Operation(summary = "Get user's orders by status", description = "Retrieve orders of a specific user with a specific status")
        public ResponseEntity<ApiResponse<Page<OrderDTO>>> getUserOrdersByStatus(
                        @PathVariable Long userId,
                        @PathVariable String status,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<OrderDTO> orders = orderService.getOrdersByUserIdAndStatus(userId, status, pageable);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Lấy danh sách đơn hàng thành công", orders));
        }

        @GetMapping("/date-range")
        @Operation(summary = "Get orders by date range", description = "Retrieve orders within a date range")
        public ResponseEntity<ApiResponse<Page<OrderDTO>>> getOrdersByDateRange(
                        @RequestParam String startDate,
                        @RequestParam String endDate,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
                LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");
                Pageable pageable = PageRequest.of(page, size);
                Page<OrderDTO> orders = orderService.getOrdersByDateRange(start, end, pageable);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Lấy danh sách đơn hàng thành công", orders));
        }

        @GetMapping("/search/phone")
        @Operation(summary = "Search orders by phone number", description = "Retrieve orders by customer's phone number")
        public ResponseEntity<ApiResponse<Page<OrderDTO>>> searchOrdersByPhoneNumber(
                        @RequestParam String phoneNumber,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<OrderDTO> orders = orderService.searchOrdersByPhoneNumber(phoneNumber, pageable);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Tìm kiếm đơn hàng thành công", orders));
        }

        @PutMapping("/{id}/status")
        @Operation(summary = "Update order status", description = "Update order status. When changing to COMPLETED, stock will be updated. "
                        +
                        "When changing to CANCELLED (from COMPLETED), stock will be restored.")
        public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
                        @PathVariable Long id,
                        @RequestParam String status) {
                OrderDTO updatedOrder = orderService.updateOrderStatus(id, status);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Cập nhật trạng thái đơn hàng thành công", updatedOrder));
        }

        @PutMapping("/{id}/cancel")
        @Operation(summary = "Cancel order", description = "Cancel an order (only PENDING or CONFIRMED orders can be cancelled)")
        public ResponseEntity<ApiResponse<OrderDTO>> cancelOrder(@PathVariable Long id) {
                OrderDTO cancelledOrder = orderService.cancelOrder(id);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Đơn hàng đã được hủy", cancelledOrder));
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "Delete order", description = "Delete an order (only CANCELLED or PENDING orders can be deleted)")
        public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
                orderService.deleteOrder(id);
                return ResponseEntity.ok(
                                new ApiResponse<>(200, "Đơn hàng đã được xóa", null));
        }
}
