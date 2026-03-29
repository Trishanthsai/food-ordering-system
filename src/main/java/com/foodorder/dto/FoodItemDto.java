package com.foodorder.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO for food item create/update requests and responses.
 */
@Data
public class FoodItemDto {

    private Long foodId;

    @NotBlank(message = "Food name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stock;

    private String imageUrl;

    @NotBlank(message = "Category is required")
    private String category;
}
