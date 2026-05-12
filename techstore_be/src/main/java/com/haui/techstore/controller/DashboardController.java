package com.haui.techstore.controller;

import com.haui.techstore.dto.ApiResponse;
import com.haui.techstore.service.OrderService;
import com.haui.techstore.service.UserService;
import com.haui.techstore.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "APIs for dashboard statistics")
public class DashboardController {

    private final OrderService orderService;
    private final UserService userService;
    private final ProductService productService;

    @GetMapping("/stats/{year}")
    @Operation(summary = "Get dashboard statistics by year", description = "Retrieve total sales, orders, users, and products for a specific year")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatsByYear(@PathVariable int year) {
        try {
            Map<String, Object> stats = new HashMap<>();

            // Get year statistics from order service
            stats.put("totalSales", orderService.getTotalSalesByYear(year));
            stats.put("totalOrders", orderService.getTotalOrdersByYear(year));

            // Get user count
            stats.put("totalUsers", userService.getTotalUsersCount());

            // Get product count
            stats.put("totalProducts", productService.getTotalProductsCount());

            return ResponseEntity.ok(
                    new ApiResponse<>(200, "Lấy thống kê theo năm thành công", stats));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    new ApiResponse<>(500, "Lỗi khi lấy thống kê: " + e.getMessage(), null));
        }
    }

    @GetMapping("/available-years")
    @Operation(summary = "Get available years for statistics", description = "Retrieve list of years that have order data")
    public ResponseEntity<ApiResponse<java.util.List<Integer>>> getAvailableYears() {
        try {
            java.util.List<Integer> years = orderService.getAvailableYears();
            return ResponseEntity.ok(
                    new ApiResponse<>(200, "Lấy danh sách năm thành công", years));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    new ApiResponse<>(500, "Lỗi khi lấy danh sách năm: " + e.getMessage(), null));
        }
    }
}
