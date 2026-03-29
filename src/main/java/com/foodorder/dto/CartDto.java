package com.foodorder.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTOs for cart operations.
 */
public class CartDto {

    /**
     * Request to add or update a cart item.
     */
    @Data
    public static class CartRequest {
        private Long foodId;
        private Integer quantity;
    }

    /**
     * Full cart response for the logged-in user.
     */
    @Data
    public static class CartResponse {
        private List<CartItemResponse> items;
        private BigDecimal totalAmount;
        private Integer totalItems;
    }

    /**
     * Individual cart item in the response.
     */
    @Data
    public static class CartItemResponse {
        private Long cartItemId;
        private Long foodId;
        private String foodName;
        private String foodImageUrl;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal subtotal;
        private Integer availableStock;
    }
}
