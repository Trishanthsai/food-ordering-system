package com.foodorder.service;

import com.foodorder.dto.CartDto;
import com.foodorder.entity.CartItem;
import com.foodorder.entity.FoodItem;
import com.foodorder.entity.User;
import com.foodorder.repository.CartItemRepository;
import com.foodorder.repository.FoodItemRepository;
import com.foodorder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service handling cart operations for authenticated users.
 */
@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private UserRepository userRepository;

    /** Get full cart for a user */
    public CartDto.CartResponse getCart(String email) {
        User user = getUser(email);
        List<CartItem> items = cartItemRepository.findByUser(user);
        return buildCartResponse(items);
    }

    /** Add item to cart or increase quantity if already exists */
    @Transactional
    public CartDto.CartResponse addToCart(String email, CartDto.CartRequest request) {
        User user = getUser(email);
        FoodItem food = getFood(request.getFoodId());

        // Validate quantity against available stock
        if (request.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be at least 1");
        }

        Optional<CartItem> existing = cartItemRepository.findByUserAndFoodItem(user, food);

        if (existing.isPresent()) {
            // Update quantity if item already in cart
            CartItem cartItem = existing.get();
            int newQty = cartItem.getQuantity() + request.getQuantity();
            if (newQty > food.getStock()) {
                throw new RuntimeException("Requested quantity exceeds available stock");
            }
            cartItem.setQuantity(newQty);
            cartItemRepository.save(cartItem);
        } else {
            // Add new cart item
            if (request.getQuantity() > food.getStock()) {
                throw new RuntimeException("Requested quantity exceeds available stock");
            }
            CartItem newItem = CartItem.builder()
                    .user(user)
                    .foodItem(food)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(newItem);
        }

        return getCart(email);
    }

    /** Update quantity of a specific cart item */
    @Transactional
    public CartDto.CartResponse updateCartItem(String email, Long cartItemId, Integer quantity) {
        User user = getUser(email);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Ensure cart item belongs to this user
        if (!cartItem.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            cartItemRepository.delete(cartItem);
        } else {
            if (quantity > cartItem.getFoodItem().getStock()) {
                throw new RuntimeException("Requested quantity exceeds available stock");
            }
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        return getCart(email);
    }

    /** Remove a specific item from cart */
    @Transactional
    public CartDto.CartResponse removeFromCart(String email, Long cartItemId) {
        User user = getUser(email);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUser().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Unauthorized");
        }

        cartItemRepository.delete(cartItem);
        return getCart(email);
    }

    /** Clear all items from user's cart */
    @Transactional
    public void clearCart(String email) {
        User user = getUser(email);
        cartItemRepository.deleteByUser(user);
    }

    // ---------- HELPERS ----------

    private CartDto.CartResponse buildCartResponse(List<CartItem> items) {
        List<CartDto.CartItemResponse> itemResponses = items.stream().map(item -> {
            CartDto.CartItemResponse r = new CartDto.CartItemResponse();
            r.setCartItemId(item.getCartItemId());
            r.setFoodId(item.getFoodItem().getFoodId());
            r.setFoodName(item.getFoodItem().getName());
            r.setFoodImageUrl(item.getFoodItem().getImageUrl());
            r.setPrice(item.getFoodItem().getPrice());
            r.setQuantity(item.getQuantity());
            r.setSubtotal(item.getFoodItem().getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity())));
            r.setAvailableStock(item.getFoodItem().getStock());
            return r;
        }).collect(Collectors.toList());

        BigDecimal total = itemResponses.stream()
                .map(CartDto.CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CartDto.CartResponse response = new CartDto.CartResponse();
        response.setItems(itemResponses);
        response.setTotalAmount(total);
        response.setTotalItems(itemResponses.size());
        return response;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private FoodItem getFood(Long foodId) {
        return foodItemRepository.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food item not found"));
    }
}
