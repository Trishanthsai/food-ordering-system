package com.foodorder.service;

import com.foodorder.dto.OrderDto;
import com.foodorder.entity.*;
import com.foodorder.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for order placement, retrieval, and status management.
 * Business rules:
 *  - Stock is reserved only after successful payment.
 *  - User can cancel only if status is PLACED.
 *  - Cancellation sets payment status to REFUNDED (dummy).
 */
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    /**
     * Place a new order from the user's current cart.
     * Creates order with PLACED status and payment with PENDING status.
     * Actual stock deduction happens on payment confirmation.
     */
    @Transactional
    public OrderDto.OrderResponse placeOrder(String email, OrderDto.PlaceOrderRequest request) {
        User user = getUser(email);
        List<CartItem> cartItems = cartItemRepository.findByUser(user);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Validate stock availability for all items before placing
        for (CartItem cartItem : cartItems) {
            FoodItem food = cartItem.getFoodItem();
            if (food.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock for: " + food.getName() +
                        " (available: " + food.getStock() + ")");
            }
        }

        // Calculate total price
        BigDecimal total = cartItems.stream()
                .map(ci -> ci.getFoodItem().getPrice()
                        .multiply(BigDecimal.valueOf(ci.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Create order
        Order order = Order.builder()
                .user(user)
                .totalPrice(total)
                .status(Order.OrderStatus.PLACED)
                .deliveryAddress(request.getDeliveryAddress())
                .build();
        order = orderRepository.save(order);

        // Create order items
        final Order savedOrder = order;
        List<OrderItem> orderItems = cartItems.stream().map(ci -> OrderItem.builder()
                .order(savedOrder)
                .foodItem(ci.getFoodItem())
                .quantity(ci.getQuantity())
                .subtotal(ci.getFoodItem().getPrice()
                        .multiply(BigDecimal.valueOf(ci.getQuantity())))
                .build()).collect(Collectors.toList());

        order.setOrderItems(orderItems);

        // Create payment record with PENDING status
        Payment payment = Payment.builder()
                .order(savedOrder)
                .paymentStatus(Payment.PaymentStatus.PENDING)
                .paymentMode(request.getPaymentMode())
                .build();
        paymentRepository.save(payment);

        // Clear the cart after order is placed
        cartItemRepository.deleteByUser(user);

        return toOrderResponse(orderRepository.save(order));
    }

    /**
     * Confirm payment (dummy Razorpay integration).
     * Deducts stock only after successful payment.
     */
    @Transactional
    public OrderDto.OrderResponse confirmPayment(OrderDto.PaymentConfirmRequest request) {
        Order order = getOrder(request.getOrderId());
        Payment payment = paymentRepository.findByOrderOrderId(order.getOrderId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // Simulate payment success (in production, verify Razorpay signature here)
        payment.setPaymentStatus(Payment.PaymentStatus.SUCCESS);
        payment.setTransactionId(request.getRazorpayPaymentId());
        paymentRepository.save(payment);

        // Deduct stock for each ordered item after successful payment
        for (OrderItem item : order.getOrderItems()) {
            FoodItem food = item.getFoodItem();
            int newStock = food.getStock() - item.getQuantity();
            if (newStock < 0) {
                throw new RuntimeException("Stock insufficient for: " + food.getName());
            }
            food.setStock(newStock);
            foodItemRepository.save(food);
        }

        return toOrderResponse(order);
    }

    /** Get all orders for logged-in user */
    public List<OrderDto.OrderResponse> getUserOrders(String email) {
        User user = getUser(email);
        return orderRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::toOrderResponse).collect(Collectors.toList());
    }

    /** Get single order by ID (user must own it) */
    public OrderDto.OrderResponse getOrderById(String email, Long orderId) {
        User user = getUser(email);
        Order order = getOrder(orderId);

        // Ensure user owns this order
        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Unauthorized");
        }

        return toOrderResponse(order);
    }

    /**
     * User cancels their own order.
     * Only allowed if status is PLACED (not yet PREPARING).
     */
    @Transactional
    public OrderDto.OrderResponse cancelOrder(String email, Long orderId) {
        User user = getUser(email);
        Order order = getOrder(orderId);

        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (order.getStatus() != Order.OrderStatus.PLACED) {
            throw new RuntimeException(
                    "Order cannot be cancelled. Current status: " + order.getStatus());
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Mark payment as REFUNDED (dummy)
        paymentRepository.findByOrderOrderId(orderId).ifPresent(p -> {
            p.setPaymentStatus(Payment.PaymentStatus.REFUNDED);
            paymentRepository.save(p);
        });

        return toOrderResponse(order);
    }

    // ---------- ADMIN OPERATIONS ----------

    /** Admin: get all orders */
    public List<OrderDto.OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toOrderResponse).collect(Collectors.toList());
    }

    /** Admin: update order status */
    @Transactional
    public OrderDto.OrderResponse updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = getOrder(orderId);
        order.setStatus(status);

        // If admin cancels, set payment to REFUNDED
        if (status == Order.OrderStatus.CANCELLED) {
            paymentRepository.findByOrderOrderId(orderId).ifPresent(p -> {
                p.setPaymentStatus(Payment.PaymentStatus.REFUNDED);
                paymentRepository.save(p);
            });
        }

        return toOrderResponse(orderRepository.save(order));
    }

    /** Admin: get all payments */
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    // ---------- MAPPER ----------

    public OrderDto.OrderResponse toOrderResponse(Order order) {
        OrderDto.OrderResponse res = new OrderDto.OrderResponse();
        res.setOrderId(order.getOrderId());
        res.setUserName(order.getUser().getName());
        res.setUserEmail(order.getUser().getEmail());
        res.setTotalPrice(order.getTotalPrice());
        res.setStatus(order.getStatus().name());
        res.setCreatedAt(order.getCreatedAt());
        res.setDeliveryAddress(order.getDeliveryAddress());

        if (order.getOrderItems() != null) {
            res.setItems(order.getOrderItems().stream().map(oi -> {
                OrderDto.OrderItemResponse ir = new OrderDto.OrderItemResponse();
                ir.setOrderItemId(oi.getOrderItemId());
                ir.setFoodId(oi.getFoodItem().getFoodId());
                ir.setFoodName(oi.getFoodItem().getName());
                ir.setFoodImageUrl(oi.getFoodItem().getImageUrl());
                ir.setQuantity(oi.getQuantity());
                ir.setSubtotal(oi.getSubtotal());
                return ir;
            }).collect(Collectors.toList()));
        }

        paymentRepository.findByOrderOrderId(order.getOrderId()).ifPresent(p -> {
            OrderDto.PaymentResponse pr = new OrderDto.PaymentResponse();
            pr.setPaymentId(p.getPaymentId());
            pr.setPaymentStatus(p.getPaymentStatus().name());
            pr.setPaymentMode(p.getPaymentMode());
            pr.setTransactionId(p.getTransactionId());
            res.setPayment(pr);
        });

        return res;
    }

    // ---------- HELPERS ----------

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
    }
}
