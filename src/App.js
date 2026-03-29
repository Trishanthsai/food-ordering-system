// src/App.js
// Root component — sets up providers and all routes

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// User Pages
import LoginPage       from './pages/user/LoginPage';
import RegisterPage    from './pages/user/RegisterPage';
import MenuPage        from './pages/user/MenuPage';
import CartPage        from './pages/user/CartPage';
import CheckoutPage    from './pages/user/CheckoutPage';
import OrderSuccess    from './pages/user/OrderSuccess';
import MyOrdersPage    from './pages/user/MyOrdersPage';
import OrderDetail     from './pages/user/OrderDetail';

// Admin Pages
import AdminLogin      from './pages/admin/AdminLogin';
import AdminDashboard  from './pages/admin/AdminDashboard';
import FoodManagement  from './pages/admin/FoodManagement';
import OrderManagement from './pages/admin/OrderManagement';
import PaymentManagement from './pages/admin/PaymentManagement';

// ─── Route Guards ─────────────────────────────────────────────────────────────

/** Requires USER role */
const UserRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user)            return <Navigate to="/login" />;
  if (user.role !== 'USER') return <Navigate to="/admin/dashboard" />;
  return children;
};

/** Requires ADMIN role */
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user)             return <Navigate to="/admin/login" />;
  if (user.role !== 'ADMIN') return <Navigate to="/menu" />;
  return children;
};

/** Redirect already-logged-in users away from login/register */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/menu'} />;
  return children;
};

// ─── App Routes ───────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/menu" />} />

      {/* Public routes */}
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/menu"     element={<MenuPage />} />

      {/* User protected routes */}
      <Route path="/cart"     element={<UserRoute><CartPage /></UserRoute>} />
      <Route path="/checkout" element={<UserRoute><CheckoutPage /></UserRoute>} />
      <Route path="/order-success/:id" element={<UserRoute><OrderSuccess /></UserRoute>} />
      <Route path="/my-orders"         element={<UserRoute><MyOrdersPage /></UserRoute>} />
      <Route path="/my-orders/:id"     element={<UserRoute><OrderDetail /></UserRoute>} />

      {/* Admin routes */}
      <Route path="/admin/login"       element={<PublicRoute><AdminLogin /></PublicRoute>} />
      <Route path="/admin/dashboard"   element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/foods"       element={<AdminRoute><FoodManagement /></AdminRoute>} />
      <Route path="/admin/orders"      element={<AdminRoute><OrderManagement /></AdminRoute>} />
      <Route path="/admin/payments"    element={<AdminRoute><PaymentManagement /></AdminRoute>} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/menu" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
