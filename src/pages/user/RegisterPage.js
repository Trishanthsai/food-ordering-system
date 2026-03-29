// src/pages/user/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const RegisterPage = () => {
  const { login } = useAuth();
  const { fetchCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data);
      await fetchCart();
      navigate('/menu');
    } catch (err) {
      setError(err.response?.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="card-body">
          <h2>Create account</h2>
          <p>Join us and start ordering delicious food</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                className="form-control"
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
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
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Register'}
            </button>
          </form>

          <p className="mt-2" style={{ fontSize: 13, textAlign: 'center' }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
