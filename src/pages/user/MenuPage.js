// src/pages/user/MenuPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { getFoods } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const CATEGORIES = ['All', 'Starters', 'Main Course', 'Biryani', 'Pizza', 'Burgers', 'Desserts', 'Drinks'];

const MenuPage = () => {
  const { user } = useAuth();
  const { addItem, fetchCart } = useCart();
  const navigate = useNavigate();

  const [foods, setFoods]         = useState([]);
  const [keyword, setKeyword]     = useState('');
  const [category, setCategory]   = useState('');
  const [loading, setLoading]     = useState(true);
  const [addingId, setAddingId]   = useState(null);
  const [message, setMessage]     = useState('');

  // Fetch foods on keyword/category change
  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFoods(keyword, category === 'All' ? '' : category);
      setFoods(res.data);
    } catch (err) {
      console.error('Failed to load foods', err);
    } finally {
      setLoading(false);
    }
  }, [keyword, category]);

  useEffect(() => {
    // Load cart once if user is logged in
    if (user?.role === 'USER') fetchCart();
  }, [user, fetchCart]);

  useEffect(() => {
    const t = setTimeout(fetchFoods, 300); // debounce keyword input
    return () => clearTimeout(t);
  }, [fetchFoods]);

  const handleAddToCart = async (foodId) => {
    if (!user) { navigate('/login'); return; }
    setAddingId(foodId);
    try {
      await addItem(foodId, 1);
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(err.response?.data || 'Could not add to cart');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="container page-body">
        <div className="page-header">
          <h1>Our Menu</h1>
          <p>Fresh, delicious food delivered to your door</p>
        </div>

        {/* Flash message */}
        {message && <div className="alert alert-success">{message}</div>}

        {/* Search & filter bar */}
        <div className="search-bar">
          <input
            className="form-control"
            type="text"
            placeholder="Search food items…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <select
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: 180 }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c === 'All' ? '' : c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Food grid */}
        {loading ? (
          <div className="loading">Loading menu…</div>
        ) : foods.length === 0 ? (
          <div className="empty-state">
            <h3>No items found</h3>
            <p>Try a different search or category.</p>
          </div>
        ) : (
          <div className="food-grid">
            {foods.map((food) => (
              <div key={food.foodId} className="card food-card">
                {food.imageUrl ? (
                  <img src={food.imageUrl} alt={food.name} />
                ) : (
                  <div className="img-placeholder">No Image</div>
                )}
                <div className="food-card-body">
                  <div className="food-card-name">{food.name}</div>
                  <div className="food-card-desc">{food.description}</div>
                  <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>
                    {food.category}
                  </div>
                  <div className="food-card-footer">
                    <span className="food-card-price">₹{food.price}</span>
                    <span className="food-card-stock">
                      {food.stock > 0 ? `${food.stock} left` : 'Out of stock'}
                    </span>
                  </div>
                  <button
                    className="btn btn-primary btn-sm w-100 mt-1"
                    disabled={food.stock === 0 || addingId === food.foodId}
                    onClick={() => handleAddToCart(food.foodId)}
                    style={{ marginTop: 10 }}
                  >
                    {addingId === food.foodId ? 'Adding…' : food.stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
