// src/pages/admin/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/common/AdminSidebar';
import { getDashboard } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Overview of your food ordering platform</p>
        </div>

        {loading ? (
          <div className="loading">Loading stats…</div>
        ) : stats ? (
          <>
            {/* Stats grid */}
            <div className="stats-grid">
              <StatCard label="Total Users"   value={stats.totalUsers}    color="#1a73e8" />
              <StatCard label="Food Items"    value={stats.totalFoodItems} color="#e85d04" />
              <StatCard label="Total Orders"  value={stats.totalOrders}   color="#1a1a1a" />
              <StatCard label="Revenue"       value={`₹${stats.totalRevenue}`} color="#2d9e5f" />
            </div>

            {/* Order breakdown */}
            <div className="card mt-3">
              <div className="card-body">
                <h3 style={{ marginBottom: 16, fontSize: '0.95rem' }}>Order Status Breakdown</h3>
                <div className="stats-grid" style={{ marginBottom: 0 }}>
                  <StatCard label="Placed"    value={stats.placedOrders}    color="#1a73e8" small />
                  <StatCard label="Preparing" value={stats.preparingOrders} color="#e6a817" small />
                  <StatCard label="Delivered" value={stats.deliveredOrders} color="#2d9e5f" small />
                  <StatCard label="Cancelled" value={stats.cancelledOrders} color="#d93025" small />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="alert alert-error">Failed to load stats</div>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ label, value, color, small }) => (
  <div className="card stat-card">
    <div className="stat-label">{label}</div>
    <div className="stat-value" style={{ color, fontSize: small ? '1.5rem' : '2rem' }}>
      {value}
    </div>
  </div>
);

export default AdminDashboard;
