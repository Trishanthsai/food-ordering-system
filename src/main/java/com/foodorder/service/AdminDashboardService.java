package com.foodorder.service;

import com.foodorder.entity.Order;
import com.foodorder.entity.Payment;
import com.foodorder.repository.FoodItemRepository;
import com.foodorder.repository.OrderRepository;
import com.foodorder.repository.PaymentRepository;
import com.foodorder.repository.UserRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service for admin dashboard statistics.
 */
@Service
public class AdminDashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    /**
     * Build and return dashboard statistics for the admin.
     */
    public DashboardStats getDashboardStats() {
        List<Order> allOrders = orderRepository.findAll();
        List<Payment> allPayments = paymentRepository.findAll();

        long totalOrders = allOrders.size();
        long placedOrders = allOrders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.PLACED).count();
        long preparingOrders = allOrders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.PREPARING).count();
        long deliveredOrders = allOrders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED).count();
        long cancelledOrders = allOrders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.CANCELLED).count();

        BigDecimal totalRevenue = allPayments.stream()
                .filter(p -> p.getPaymentStatus() == Payment.PaymentStatus.SUCCESS)
                .map(p -> p.getOrder().getTotalPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        DashboardStats stats = new DashboardStats();
        stats.setTotalUsers(userRepository.count());
        stats.setTotalFoodItems(foodItemRepository.count());
        stats.setTotalOrders(totalOrders);
        stats.setPlacedOrders(placedOrders);
        stats.setPreparingOrders(preparingOrders);
        stats.setDeliveredOrders(deliveredOrders);
        stats.setCancelledOrders(cancelledOrders);
        stats.setTotalRevenue(totalRevenue);

        return stats;
    }

    @Data
    public static class DashboardStats {
        private long totalUsers;
        private long totalFoodItems;
        private long totalOrders;
        private long placedOrders;
        private long preparingOrders;
        private long deliveredOrders;
        private long cancelledOrders;
        private BigDecimal totalRevenue;
    }
}
