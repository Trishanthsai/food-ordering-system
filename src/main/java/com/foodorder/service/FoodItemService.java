package com.foodorder.service;

import com.foodorder.dto.FoodItemDto;
import com.foodorder.entity.FoodItem;
import com.foodorder.repository.FoodItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for food item CRUD operations.
 * Admin-only for create, update, delete.
 * Public access for read and search.
 */
@Service
public class FoodItemService {

    @Autowired
    private FoodItemRepository foodItemRepository;

    // ---------- READ OPERATIONS ----------

    /** Get all food items */
    public List<FoodItemDto> getAllFoodItems() {
        return foodItemRepository.findAll()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    /** Get single food item by ID */
    public FoodItemDto getFoodItemById(Long id) {
        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found: " + id));
        return toDto(item);
    }

    /** Search and filter food items */
    public List<FoodItemDto> searchFoodItems(String keyword, String category) {
        List<FoodItem> results;

        if (keyword != null && !keyword.isBlank() && category != null && !category.isBlank()) {
            results = foodItemRepository.findByCategoryAndKeyword(category, keyword);
        } else if (keyword != null && !keyword.isBlank()) {
            results = foodItemRepository.searchByKeyword(keyword);
        } else if (category != null && !category.isBlank()) {
            results = foodItemRepository.findByCategory(category);
        } else {
            results = foodItemRepository.findAll();
        }

        return results.stream().map(this::toDto).collect(Collectors.toList());
    }

    // ---------- ADMIN WRITE OPERATIONS ----------

    /** Add a new food item */
    public FoodItemDto addFoodItem(FoodItemDto dto) {
        FoodItem item = toEntity(dto);
        return toDto(foodItemRepository.save(item));
    }

    /** Update an existing food item */
    public FoodItemDto updateFoodItem(Long id, FoodItemDto dto) {
        FoodItem existing = foodItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found: " + id));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setPrice(dto.getPrice());
        existing.setStock(dto.getStock());
        existing.setImageUrl(dto.getImageUrl());
        existing.setCategory(dto.getCategory());

        return toDto(foodItemRepository.save(existing));
    }

    /** Update only the stock of a food item */
    public FoodItemDto updateStock(Long id, Integer stock) {
        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found: " + id));
        if (stock < 0) throw new RuntimeException("Stock cannot be negative");
        item.setStock(stock);
        return toDto(foodItemRepository.save(item));
    }

    /** Delete a food item */
    public void deleteFoodItem(Long id) {
        if (!foodItemRepository.existsById(id)) {
            throw new RuntimeException("Food item not found: " + id);
        }
        foodItemRepository.deleteById(id);
    }

    // ---------- MAPPERS ----------

    public FoodItemDto toDto(FoodItem item) {
        FoodItemDto dto = new FoodItemDto();
        dto.setFoodId(item.getFoodId());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setPrice(item.getPrice());
        dto.setStock(item.getStock());
        dto.setImageUrl(item.getImageUrl());
        dto.setCategory(item.getCategory());
        return dto;
    }

    private FoodItem toEntity(FoodItemDto dto) {
        return FoodItem.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .stock(dto.getStock())
                .imageUrl(dto.getImageUrl())
                .category(dto.getCategory())
                .build();
    }
}
