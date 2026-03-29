// src/pages/user/OrderSuccess.js
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import { getOrderById } from '../../services/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrderById(id)
      .then((res) => setOrder(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  return (
    <div className="page">
      <Navbar />
      <div className="container page-body">
        <div style={{ textAlign: 'center', padding: '40px 0 32px' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Order Placed!</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Your order #{id} has been placed successfully.
          </p>
        </div>

        {order && (
          <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="card-body">
              <div className="flex-between mb-2">
                <h3 style={{ fontSize: '1rem' }}>Order #{order.orderId}</h3>
                <StatusBadge status={order.status} />
              </div>

              {/* Items */}
              {order.items?.map((item) => (
                <div key={item.orderItemId} className="flex-between"
                  style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span>{item.foodName} × {item.quantity}</span>
                  <span>₹{item.subtotal}</span>
                </div>
              ))}

              <div className="flex-between mt-2" style={{ fontWeight: 700, fontSize: 16 }}>
                <span>Total Paid</span>
                <span>₹{order.totalPrice}</span>
              </div>

              {order.payment && (
                <div style={{ marginTop: 16, padding: 12, background: 'var(--bg)',
                  borderRadius: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                  <div><b>Payment:</b> <StatusBadge status={order.payment.paymentStatus} /></div>
                  <div style={{ marginTop: 4 }}><b>Mode:</b> {order.payment.paymentMode}</div>
                  {order.payment.transactionId && (
                    <div style={{ marginTop: 4 }}>
                      <b>Txn ID:</b> {order.payment.transactionId}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <Link to="/my-orders" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Track Order
                </Link>
                <Link to="/menu" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                  Order More
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccess;
