// src/components/common/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartCount = cart?.items?.length || 0;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/menu" className="navbar-brand">🍽 FoodOrder</Link>
        <div className="navbar-links">
          <Link to="/menu">Menu</Link>
          {user ? (
            <>
              <Link to="/cart">
                Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              <Link to="/my-orders">My Orders</Link>
              <span style={{ color: '#999', fontSize: 13 }}>Hi, {user.name}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
