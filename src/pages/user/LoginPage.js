// src/pages/user/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const LoginPage = () => {
  const { login } = useAuth();
  const { fetchCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data);
      // Load cart for USER role
      if (res.data.role === 'USER') {
        await fetchCart();
        navigate('/menu');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="card-body">
          <h2>Welcome back</h2>
          <p>Login to your account to continue</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                className="form-control"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                className="form-control"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <p className="mt-2" style={{ fontSize: 13, textAlign: 'center' }}>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
          <p style={{ fontSize: 13, textAlign: 'center', color: '#999', marginTop: 8 }}>
            Admin? <Link to="/admin/login">Admin Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
