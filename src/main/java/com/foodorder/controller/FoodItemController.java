package com.foodorder.controller;

import com.foodorder.dto.FoodItemDto;
import com.foodorder.service.FoodItemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for food item operations.
 * GET endpoints are public. POST/PUT/DELETE require ADMIN role.
 */
@RestController
@RequestMapping("/api/foods")
public class FoodItemController {

    @Autowired
    private FoodItemService foodItemService;

    /** GET /api/foods — get all or search/filter */
    @GetMapping
    public ResponseEntity<List<FoodItemDto>> getFoodItems(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(foodItemService.searchFoodItems(keyword, category));
    }

    /** GET /api/foods/{id} — get single food item */
    @GetMapping("/{id}")
    public ResponseEntity<?> getFoodItem(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(foodItemService.getFoodItemById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** POST /api/foods — add food item (ADMIN only) */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addFoodItem(@Valid @RequestBody FoodItemDto dto) {
        try {
            return ResponseEntity.ok(foodItemService.addFoodItem(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** PUT /api/foods/{id} — update food item (ADMIN only) */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateFoodItem(
            @PathVariable Long id, @Valid @RequestBody FoodItemDto dto) {
        try {
            return ResponseEntity.ok(foodItemService.updateFoodItem(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** PATCH /api/foods/{id}/stock — update only stock (ADMIN only) */
    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStock(
            @PathVariable Long id, @RequestParam Integer stock) {
        try {
            return ResponseEntity.ok(foodItemService.updateStock(id, stock));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** DELETE /api/foods/{id} — delete food item (ADMIN only) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFoodItem(@PathVariable Long id) {
        try {
            foodItemService.deleteFoodItem(id);
            return ResponseEntity.ok("Food item deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
