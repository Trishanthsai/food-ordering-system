import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/common/AdminSidebar';
import StatusBadge from '../../components/common/StatusBadge';
import { getAllOrders } from '../../services/api';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('');

  useEffect(() => {
    getAllOrders()
      .then((res) => {
        const paymentList = res.data
          .filter((order) => order.payment)
          .map((order) => ({
            paymentId:     order.payment.paymentId,
            orderId:       order.orderId,
            userName:      order.userName,
            userEmail:     order.userEmail,
            totalPrice:    order.totalPrice,
            paymentStatus: order.payment.paymentStatus,
            paymentMode:   order.payment.paymentMode,
            transactionId: order.payment.transactionId,
            createdAt:     order.createdAt,
          }));
        setPayments(paymentList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const STATUSES = ['SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'];

  const filtered = filter
    ? payments.filter((p) => p.paymentStatus === filter)
    : payments;

  const totalRevenue = payments
    .filter((p) => p.paymentStatus === 'SUCCESS')
    .reduce((acc, p) => acc + parseFloat(p.totalPrice || 0), 0);

  const refundedCount = payments.filter((p) => p.paymentStatus === 'REFUNDED').length;

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <div className="page-header">
          <h1>Payment Management</h1>
          <p>View all payment transactions</p>
        </div>

        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="card stat-card">
            <div className="stat-label">Total Payments</div>
            <div className="stat-value">{payments.length}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Revenue</div>
            <div className="stat-value" style={{ color: 'var(--success)', fontSize: '1.5rem' }}>
              ₹{totalRevenue.toFixed(2)}
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Refunded</div>
            <div className="stat-value" style={{ color: '#7c3aed', fontSize: '1.5rem' }}>
              {refundedCount}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {['', ...STATUSES].map((s) => (
            <button
              key={s || 'ALL'}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter(s)}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading payments...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No payments found</h3>
            <p>Payments will appear here once users place orders.</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th>Transaction ID</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.paymentId}>
                      <td style={{ fontWeight: 700 }}>{p.paymentId}</td>
                      <td>#{p.orderId}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.userName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.userEmail}</div>
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{p.totalPrice}</td>
                      <td>{p.paymentMode || '—'}</td>
                      <td><StatusBadge status={p.paymentStatus} /></td>
                      <td style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {p.transactionId || '—'}
                      </td>
                      <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                        {new Date(p.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit'
                        })}
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

export default PaymentManagement