package com.foodorder.repository;

import com.foodorder.entity.CartItem;
import com.foodorder.entity.User;
import com.foodorder.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserAndFoodItem(User user, FoodItem foodItem);
    void deleteByUser(User user);
}
