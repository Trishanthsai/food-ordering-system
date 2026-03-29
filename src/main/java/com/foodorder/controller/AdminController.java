package com.foodorder.controller;

import com.foodorder.dto.OrderDto;
import com.foodorder.entity.Order;
import com.foodorder.entity.Payment;
import com.foodorder.service.AdminDashboardService;
import com.foodorder.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for admin-only operations.
 * All endpoints require ADMIN role.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminDashboardService dashboardService;

    @Autowired
    private OrderService orderService;

    /** GET /api/admin/dashboard — get dashboard statistics */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    /** GET /api/admin/orders — get all orders */
    @GetMapping("/orders")
    public ResponseEntity<List<OrderDto.OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    /** PUT /api/admin/orders/{id}/status — update order status */
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody OrderDto.UpdateStatusRequest request) {
        try {
            return ResponseEntity.ok(
                    orderService.updateOrderStatus(id, request.getStatus()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** GET /api/admin/payments — get all payments */
    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(orderService.getAllPayments());
    }
}
