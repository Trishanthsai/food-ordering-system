package com.foodorder.controller;

import com.foodorder.dto.OrderDto;
import com.foodorder.entity.Order;
import com.foodorder.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for order operations (user side).
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /** POST /api/orders — place a new order from cart */
    @PostMapping
    public ResponseEntity<?> placeOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody OrderDto.PlaceOrderRequest request) {
        try {
            return ResponseEntity.ok(
                    orderService.placeOrder(userDetails.getUsername(), request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** POST /api/orders/confirm-payment — confirm dummy Razorpay payment */
    @PostMapping("/confirm-payment")
    public ResponseEntity<?> confirmPayment(
            @RequestBody OrderDto.PaymentConfirmRequest request) {
        try {
            return ResponseEntity.ok(orderService.confirmPayment(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** GET /api/orders — get all orders for logged-in user */
    @GetMapping
    public ResponseEntity<List<OrderDto.OrderResponse>> getUserOrders(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                orderService.getUserOrders(userDetails.getUsername()));
    }

    /** GET /api/orders/{id} — get specific order */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        try {
            return ResponseEntity.ok(
                    orderService.getOrderById(userDetails.getUsername(), id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** PATCH /api/orders/{id}/cancel — user cancels their order */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        try {
            return ResponseEntity.ok(
                    orderService.cancelOrder(userDetails.getUsername(), id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
