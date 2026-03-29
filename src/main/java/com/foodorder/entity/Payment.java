package com.foodorder.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing payment details for an order.
 * Uses dummy Razorpay integration in test mode.
 */
@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    // One payment belongs to one order
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @Column(name = "payment_mode")
    private String paymentMode;

    @Column(name = "transaction_id")
    private String transactionId;

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED, REFUNDED
    }
}
