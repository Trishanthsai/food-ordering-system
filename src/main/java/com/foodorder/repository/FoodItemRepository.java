package com.foodorder.repository;

import com.foodorder.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for FoodItem entity operations.
 */
@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    // Search food items by name or description (case-insensitive)
    @Query("SELECT f FROM FoodItem f WHERE LOWER(f.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(f.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<FoodItem> searchByKeyword(String keyword);

    // Filter by category
    List<FoodItem> findByCategory(String category);

    // Filter by category and name keyword
    @Query("SELECT f FROM FoodItem f WHERE f.category = :category AND " +
           "LOWER(f.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<FoodItem> findByCategoryAndKeyword(String category, String keyword);
}
