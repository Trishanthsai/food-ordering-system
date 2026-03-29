// src/context/CartContext.js
// Manages cart state globally, syncing with backend

import React, { createContext, useContext, useState, useCallback } from 'react';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0, totalItems: 0 });
  const [cartLoading, setCartLoading] = useState(false);

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    if (!user || user.role !== 'USER') return;
    try {
      setCartLoading(true);
      const res = await getCart();
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  // Add item to cart
  const addItem = async (foodId, quantity = 1) => {
    await addToCart({ foodId, quantity });
    await fetchCart();
  };

  // Update quantity
  const updateItem = async (cartItemId, quantity) => {
    await updateCartItem(cartItemId, quantity);
    await fetchCart();
  };

  // Remove item
  const removeItem = async (cartItemId) => {
    await removeCartItem(cartItemId);
    await fetchCart();
  };

  // Clear entire cart
  const emptyCart = async () => {
    await clearCart();
    setCart({ items: [], totalAmount: 0, totalItems: 0 });
  };

  return (
    <CartContext.Provider value={{
      cart, cartLoading, fetchCart, addItem, updateItem, removeItem, emptyCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
