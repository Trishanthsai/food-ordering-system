// src/pages/user/OrderDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import { getOrderById } from '../../services/api';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(id)
      .then((res) => setOrder(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <><Navbar /><div className="loading">Loading order…</div></>;
  if (!order)  return <><Navbar /><div className="loading">Order not found</div></>;

  return (
    <div className="page">
      <Navbar />
      <div className="container page-body" style={{ maxWidth: 680 }}>
        <div className="flex-between mb-2">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1>Order #{order.orderId}</h1>
            <p>
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Order items */}
        <div className="card mb-2">
          <div className="card-body">
            <h3 style={{ fontSize: '0.95rem', marginBottom: 14 }}>Items Ordered</h3>
            {order.items?.map((item) => (
              <div key={item.orderItemId}
                style={{ display: 'flex', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {item.foodImageUrl && (
                    <img src={item.foodImageUrl} alt={item.foodName}
                      style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.foodName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                  </div>
                </div>
                <span style={{ fontWeight: 700 }}>₹{item.subtotal}</span>
              </div>
            ))}
            <div className="flex-between mt-2" style={{ fontWeight: 800, fontSize: 16 }}>
              <span>Total</span>
              <span>₹{order.totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Delivery address */}
        <div className="card mb-2">
          <div className="card-body">
            <h3 style={{ fontSize: '0.95rem', marginBottom: 8 }}>Delivery Address</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {order.deliveryAddress || 'N/A'}
            </p>
          </div>
        </div>

        {/* Payment info */}
        {order.payment && (
          <div className="card mb-2">
            <div className="card-body">
              <h3 style={{ fontSize: '0.95rem', marginBottom: 12 }}>Payment Details</h3>
              <div style={{ fontSize: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>Status</span>
                  <StatusBadge status={order.payment.paymentStatus} />
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>Mode</span>
                  <span>{order.payment.paymentMode}</span>
                </div>
                {order.payment.transactionId && (
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-muted)' }}>Transaction ID</span>
                    <span style={{ fontSize: 12, fontFamily: 'monospace' }}>
                      {order.payment.transactionId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Link to="/my-orders" className="btn btn-outline btn-sm">← Back to Orders</Link>
      </div>
    </div>
  );
};

export default OrderDetail;
