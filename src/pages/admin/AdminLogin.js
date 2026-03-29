// src/pages/admin/AdminLogin.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(form);
      if (res.data.role !== 'ADMIN') {
        setError('Access denied. This login is for admins only.');
        return;
      }
      login(res.data);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="card-body">
          <h2>Admin Login</h2>
          <p>Sign in to access the admin panel</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Admin Email</label>
              <input className="form-control" type="email" name="email"
                placeholder="admin@foodorder.com"
                value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" name="password"
                placeholder="••••••••"
                value={form.password} onChange={handleChange} required />
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Login as Admin'}
            </button>
          </form>

          <p className="mt-2" style={{ fontSize: 13, textAlign: 'center' }}>
            <Link to="/login">← User Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
