package com.foodorder.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Entity representing a food item available in the menu.
 */
@Entity
@Table(name = "food_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "food_id")
    private Long foodId;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stock;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false)
    private String category;
}
