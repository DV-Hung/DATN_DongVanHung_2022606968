package com.haui.techstore.service;

import com.haui.techstore.dto.OrderDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderService {

    /**
     * Lấy tất cả đơn hàng (cho admin)
     */
    Page<OrderDTO> getAllOrders(Pageable pageable);

    /**
     * Tạo đơn hàng từ giỏ hàng (status = PENDING, chưa cập nhật stock)
     */
    OrderDTO createOrderFromCart(Long userId, OrderDTO orderDTO);

    /**
     * Tạo đơn hàng từ dữ liệu checkout (danh sách items gửi lên từ client)
     * Dùng cho cả direct purchase và cart checkout
     */
    OrderDTO createOrder(Long userId, OrderDTO orderDTO);

    /**
     * Lấy đơn hàng theo ID
     */
    OrderDTO getOrderById(Long orderId);

    /**
     * Lấy tất cả đơn hàng của người dùng
     */
    Page<OrderDTO> getOrdersByUserId(Long userId, Pageable pageable);

    /**
     * Lấy đơn hàng theo trạng thái
     */
    Page<OrderDTO> getOrdersByStatus(String status, Pageable pageable);

    /**
     * Lấy đơn hàng của người dùng theo trạng thái
     */
    Page<OrderDTO> getOrdersByUserIdAndStatus(Long userId, String status, Pageable pageable);

    /**
     * Lấy đơn hàng trong khoảng thời gian
     */
    Page<OrderDTO> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    /**
     * Tìm kiếm đơn hàng theo số điện thoại
     */
    Page<OrderDTO> searchOrdersByPhoneNumber(String phoneNumber, Pageable pageable);

    /**
     * Cập nhật trạng thái đơn hàng
     * - Nếu thay đổi thành COMPLETED: cập nhật stock
     * - Nếu thay đổi thành CANCELLED: khôi phục stock
     */
    OrderDTO updateOrderStatus(Long orderId, String newStatus);

    /**
     * Hủy đơn hàng (nếu chưa ship)
     */
    OrderDTO cancelOrder(Long orderId);

    /**
     * Xóa đơn hàng
     */
    void deleteOrder(Long orderId);
}
