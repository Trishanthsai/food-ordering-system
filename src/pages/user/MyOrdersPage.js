// src/pages/user/MyOrdersPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import { getUserOrders, cancelOrder } from '../../services/api';

const MyOrdersPage = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getUserOrders();
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(orderId);
    try {
      await cancelOrder(orderId);
      fetchOrders(); // refresh list
    } catch (err) {
      alert(err.response?.data || 'Cannot cancel this order');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <><Navbar /><div className="loading">Loading orders…</div></>;

  return (
    <div className="page">
      <Navbar />
      <div className="container page-body">
        <div className="page-header">
          <h1>My Orders</h1>
          <p>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>Place your first order from the menu!</p>
            <Link to="/menu" className="btn btn-primary mt-2">Browse Menu</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map((order) => (
              <div key={order.orderId} className="card">
                <div className="card-body">
                  <div className="flex-between mb-1">
                    <div>
                      <span style={{ fontWeight: 700 }}>Order #{order.orderId}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Items summary */}
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
                    {order.items?.map((i) => `${i.foodName} ×${i.quantity}`).join(', ')}
                  </div>

                  {/* Order timeline */}
                  <OrderTimeline status={order.status} />

                  <hr className="divider" />
                  <div className="flex-between">
                    <div style={{ fontSize: 14 }}>
                      <span style={{ fontWeight: 700 }}>₹{order.totalPrice}</span>
                      {order.payment && (
                        <span style={{ marginLeft: 10 }}>
                          <StatusBadge status={order.payment.paymentStatus} />
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {order.status === 'PLACED' && (
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={cancelling === order.orderId}
                          onClick={() => handleCancel(order.orderId)}
                        >
                          {cancelling === order.orderId ? 'Cancelling…' : 'Cancel'}
                        </button>
                      )}
                      <Link
                        to={`/my-orders/${order.orderId}`}
                        className="btn btn-outline btn-sm"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Mini order status timeline component
const STEPS = ['PLACED', 'PREPARING', 'DELIVERED'];

const OrderTimeline = ({ status }) => {
  const isCancelled = status === 'CANCELLED';
  const currentIdx  = STEPS.indexOf(status);

  return (
    <div className="order-timeline">
      {STEPS.map((step, idx) => {
        let cls = 'timeline-step';
        if (isCancelled) {
          cls += idx === 0 ? ' done' : '';
        } else {
          if (idx < currentIdx) cls += ' done';
          else if (idx === currentIdx) cls += ' active';
        }
        return (
          <div key={step} className={cls}>
            <div className={`timeline-dot ${isCancelled && idx > 0 ? 'cancelled' : ''}`} />
            <div className="timeline-label">
              {isCancelled && idx === STEPS.length - 1 ? 'CANCELLED' : step}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyOrdersPage;
