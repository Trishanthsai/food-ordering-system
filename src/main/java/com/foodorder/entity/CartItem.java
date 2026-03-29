package com.foodorder.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing a cart item (persisted cart per user).
 */
@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_item_id")
    private Long cartItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "food_id", nullable = false)
    private FoodItem foodItem;

    @Column(nullable = false)
    private Integer quantity;
}
