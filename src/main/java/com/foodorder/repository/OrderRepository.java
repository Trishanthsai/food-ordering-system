package com.foodorder.repository;

import com.foodorder.entity.Order;
import com.foodorder.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Order entity operations.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Get all orders for a specific user, sorted by date descending
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    // Get all orders sorted by date descending (admin view)
    List<Order> findAllByOrderByCreatedAtDesc();
}
