// src/pages/admin/OrderManagement.js - FIXED VERSION
import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/common/AdminSidebar';
import StatusBadge from '../../components/common/StatusBadge';
import { getAllOrders, updateOrderStatus } from '../../services/api';

const ORDER_STATUSES = ['PLACED', 'PREPARING', 'DELIVERED', 'CANCELLED'];

const OrderManagement = () => {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter]     = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getAllOrders();
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter
    ? orders.filter((o) => o.status === filter)
    : orders;

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <div className="page-header">
          <h1>Order Management</h1>
          <p>View and update all customer orders</p>
        </div>

        {/* Filter by status */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {['', ...ORDER_STATUSES].map((s) => (
            <button
              key={s || 'ALL'}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter(s)}
            >
              {s || 'All Orders'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><h3>No orders found</h3></div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.orderId}>
                      <td style={{ fontWeight: 700 }}>{order.orderId}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.userName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.userEmail}</div>
                      </td>
                      <td style={{ fontSize: 13, maxWidth: 200 }}>
                        {order.items?.map((i) => `${i.foodName} ×${i.quantity}`).join(', ')}
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{order.totalPrice}</td>
                      <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td><StatusBadge status={order.status} /></td>
                      <td>
                        {order.payment
                          ? <StatusBadge status={order.payment.paymentStatus} />
                          : '—'}
                      </td>
                      <td>
                        <select
                          className="form-control"
                          style={{ width: 140, padding: '5px 8px', fontSize: 13 }}
                          value={order.status}
                          disabled={updating === order.orderId}
                          onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderManagement;
