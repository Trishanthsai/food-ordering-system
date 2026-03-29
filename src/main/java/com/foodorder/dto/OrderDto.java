package com.foodorder.dto;

import com.foodorder.entity.Order;
import com.foodorder.entity.Payment;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs for order-related operations.
 */
public class OrderDto {

    /**
     * Request to place an order.
     */
    @Data
    public static class PlaceOrderRequest {
        private String deliveryAddress;
        private String paymentMode; // CARD, UPI, WALLET, etc.
    }

    /**
     * Response containing order details.
     */
    @Data
    public static class OrderResponse {
        private Long orderId;
        private String userName;
        private String userEmail;
        private BigDecimal totalPrice;
        private String status;
        private LocalDateTime createdAt;
        private String deliveryAddress;
        private List<OrderItemResponse> items;
        private PaymentResponse payment;
    }

    /**
     * Individual item within an order response.
     */
    @Data
    public static class OrderItemResponse {
        private Long orderItemId;
        private Long foodId;
        private String foodName;
        private String foodImageUrl;
        private Integer quantity;
        private BigDecimal subtotal;
    }

    /**
     * Payment info within order response.
     */
    @Data
    public static class PaymentResponse {
        private Long paymentId;
        private String paymentStatus;
        private String paymentMode;
        private String transactionId;
    }

    /**
     * Request to update order status (admin).
     */
    @Data
    public static class UpdateStatusRequest {
        private Order.OrderStatus status;
    }

    /**
     * Dummy Razorpay payment confirmation request.
     */
    @Data
    public static class PaymentConfirmRequest {
        private Long orderId;
        private String razorpayPaymentId;
        private String razorpayOrderId;
        private String razorpaySignature;
    }
}
