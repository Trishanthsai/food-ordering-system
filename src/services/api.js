// src/services/api.js
// Central Axios instance with JWT injection and error handling

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401 Unauthorized
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser    = (data) => API.post('/auth/login', data);

// ─── Food Items ──────────────────────────────────────────────────────────────
export const getFoods      = (keyword = '', category = '') =>
  API.get('/foods', { params: { keyword, category } });
export const getFoodById   = (id) => API.get(`/foods/${id}`);
export const addFood       = (data) => API.post('/foods', data);
export const updateFood    = (id, data) => API.put(`/foods/${id}`, data);
export const deleteFood    = (id) => API.delete(`/foods/${id}`);
export const updateStock   = (id, stock) =>
  API.patch(`/foods/${id}/stock`, null, { params: { stock } });

// ─── Cart ────────────────────────────────────────────────────────────────────
export const getCart         = () => API.get('/cart');
export const addToCart       = (data) => API.post('/cart', data);
export const updateCartItem  = (id, quantity) =>
  API.put(`/cart/${id}`, null, { params: { quantity } });
export const removeCartItem  = (id) => API.delete(`/cart/${id}`);
export const clearCart       = () => API.delete('/cart');

// ─── Orders ──────────────────────────────────────────────────────────────────
export const placeOrder      = (data) => API.post('/orders', data);
export const confirmPayment  = (data) => API.post('/orders/confirm-payment', data);
export const getUserOrders   = () => API.get('/orders');
export const getOrderById    = (id) => API.get(`/orders/${id}`);
export const cancelOrder     = (id) => API.patch(`/orders/${id}/cancel`);

// ─── Admin ───────────────────────────────────────────────────────────────────
export const getDashboard        = () => API.get('/admin/dashboard');
export const getAllOrders         = () => API.get('/admin/orders');
export const updateOrderStatus   = (id, status) =>
  API.put(`/admin/orders/${id}/status`, { status });
export const getAllPayments       = () => API.get('/admin/payments');

export default API;
