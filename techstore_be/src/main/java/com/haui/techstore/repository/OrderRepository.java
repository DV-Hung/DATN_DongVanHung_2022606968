package com.haui.techstore.repository;

import com.haui.techstore.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
        Page<Order> findByUserId(Long userId, Pageable pageable);

        Page<Order> findByStatus(String status, Pageable pageable);

        @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.status = :status")
        Page<Order> findByUserIdAndStatus(@Param("userId") Long userId,
                        @Param("status") String status,
                        Pageable pageable);

        @Query("SELECT o FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate")
        Page<Order> findByDateRange(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        Pageable pageable);

        @Query("SELECT o FROM Order o WHERE o.phone = :phoneNumber")
        Page<Order> findByPhoneNumber(@Param("phoneNumber") String phoneNumber, Pageable pageable);

        @Query("SELECT o FROM Order o WHERE YEAR(o.orderDate) = :year")
        List<Order> findByYear(@Param("year") int year);

        @Query("SELECT DISTINCT YEAR(o.orderDate) FROM Order o ORDER BY YEAR(o.orderDate) DESC")
        List<Integer> findAvailableYears();
}
