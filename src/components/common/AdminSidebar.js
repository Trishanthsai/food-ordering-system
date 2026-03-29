// src/components/common/AdminSidebar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="brand">🍽 FoodAdmin</div>
      <div style={{ padding: '0 20px 12px', fontSize: 12, color: '#888' }}>
        {user?.name}
      </div>
      <nav>
        <NavLink to="/admin/dashboard">📊 Dashboard</NavLink>
        <NavLink to="/admin/foods">🍕 Food Items</NavLink>
        <NavLink to="/admin/orders">📦 Orders</NavLink>
        <NavLink to="/admin/payments">💳 Payments</NavLink>
      </nav>
      <button className="logout-btn" onClick={handleLogout}>⏏ Logout</button>
    </aside>
  );
};

export default AdminSidebar;
