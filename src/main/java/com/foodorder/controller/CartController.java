package com.foodorder.controller;

import com.foodorder.dto.CartDto;
import com.foodorder.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for cart operations.
 * All endpoints require USER authentication.
 */
@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    /** GET /api/cart — get user's cart */
    @GetMapping
    public ResponseEntity<CartDto.CartResponse> getCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cartService.getCart(userDetails.getUsername()));
    }

    /** POST /api/cart — add item to cart */
    @PostMapping
    public ResponseEntity<?> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CartDto.CartRequest request) {
        try {
            return ResponseEntity.ok(
                    cartService.addToCart(userDetails.getUsername(), request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** PUT /api/cart/{cartItemId} — update item quantity */
    @PutMapping("/{cartItemId}")
    public ResponseEntity<?> updateCartItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        try {
            return ResponseEntity.ok(
                    cartService.updateCartItem(
                            userDetails.getUsername(), cartItemId, quantity));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** DELETE /api/cart/{cartItemId} — remove item from cart */
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<?> removeFromCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long cartItemId) {
        try {
            return ResponseEntity.ok(
                    cartService.removeFromCart(userDetails.getUsername(), cartItemId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** DELETE /api/cart — clear entire cart */
    @DeleteMapping
    public ResponseEntity<?> clearCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        cartService.clearCart(userDetails.getUsername());
        return ResponseEntity.ok("Cart cleared");
    }
}
