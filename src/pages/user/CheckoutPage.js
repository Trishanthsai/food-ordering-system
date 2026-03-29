// src/pages/user/CheckoutPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { useCart } from '../../context/CartContext';
import { placeOrder, confirmPayment } from '../../services/api';

const PAYMENT_MODES = ['CARD', 'UPI', 'WALLET', 'NET_BANKING', 'COD'];

const CheckoutPage = () => {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress]       = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const items = cart?.items || [];
  const total = cart?.totalAmount || 0;

  /**
   * Simulate Razorpay payment flow:
   * 1. Place order  → get orderId with PENDING payment
   * 2. Open dummy Razorpay modal
   * 3. On "success" confirm payment → stock deducted
   * 4. Navigate to success page
   */
  const handleCheckout = async () => {
    if (!address.trim()) { setError('Please enter a delivery address.'); return; }
    if (items.length === 0) { setError('Your cart is empty.'); return; }
    setError('');
    setLoading(true);

    try {
      // Step 1: Place the order
      const orderRes = await placeOrder({ deliveryAddress: address, paymentMode });
      const orderId  = orderRes.data.orderId;

      // Step 2: Simulate Razorpay checkout (test mode)
      await simulateRazorpay(orderId);

    } catch (err) {
      setError(err.response?.data || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Dummy Razorpay simulation.
   * In production, replace with actual Razorpay JS SDK window.Razorpay({...}).open()
   */
  const simulateRazorpay = (orderId) => {
    return new Promise((resolve, reject) => {
      // Show a simple modal that mimics Razorpay UI
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,.6);
        display:flex;align-items:center;justify-content:center;z-index:9999;
      `;
      overlay.innerHTML = `
        <div style="background:#fff;border-radius:12px;padding:32px;width:360px;
          box-shadow:0 8px 40px rgba(0,0,0,.3);text-align:center;font-family:sans-serif;">
          <div style="font-size:28px;margin-bottom:8px;">💳</div>
          <h3 style="margin-bottom:4px;color:#072654;">Razorpay — Test Mode</h3>
          <p style="font-size:13px;color:#888;margin-bottom:20px;">
            Order #${orderId} · ₹${total}
          </p>
          <div style="background:#f5f5f5;border-radius:8px;padding:14px;margin-bottom:20px;
            text-align:left;font-size:13px;color:#555;">
            <b>Payment Mode:</b> ${paymentMode}<br/>
            <b>Amount:</b> ₹${total}<br/>
            <b>Status:</b> Simulated (Test)
          </div>
          <button id="rz-pay" style="width:100%;padding:12px;background:#072654;color:#fff;
            border:none;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;
            margin-bottom:10px;">Pay ₹${total}</button>
          <button id="rz-cancel" style="width:100%;padding:10px;background:none;border:none;
            color:#888;font-size:13px;cursor:pointer;">Cancel</button>
        </div>
      `;
      document.body.appendChild(overlay);

      document.getElementById('rz-pay').onclick = async () => {
        document.body.removeChild(overlay);
        try {
          // Step 3: Confirm payment with dummy transaction ID
          await confirmPayment({
            orderId,
            razorpayPaymentId: `rzp_test_${Date.now()}`,
            razorpayOrderId:   `order_test_${orderId}`,
            razorpaySignature: `sig_test_${Date.now()}`,
          });
          navigate(`/order-success/${orderId}`);
          resolve();
        } catch (err) {
          reject(err);
        }
      };

      document.getElementById('rz-cancel').onclick = () => {
        document.body.removeChild(overlay);
        reject(new Error('Payment cancelled by user'));
      };
    });
  };

  return (
    <div className="page">
      <Navbar />
      <div className="container page-body">
        <div className="page-header">
          <h1>Checkout</h1>
          <p>Review your order and complete payment</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
          {/* Left: address + payment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Delivery address */}
            <div className="card">
              <div className="card-body">
                <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Delivery Address</h3>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Enter your full delivery address…"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="card">
              <div className="card-body">
                <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Payment Method</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {PAYMENT_MODES.map((mode) => (
                    <label key={mode} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 14px', border: `1.5px solid ${paymentMode === mode ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      color: paymentMode === mode ? 'var(--primary)' : 'var(--text)',
                      background: paymentMode === mode ? '#fff4f0' : '#fff',
                    }}>
                      <input
                        type="radio"
                        name="paymentMode"
                        value={mode}
                        checked={paymentMode === mode}
                        onChange={() => setPaymentMode(mode)}
                        style={{ display: 'none' }}
                      />
                      {mode}
                    </label>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
                  🔒 Powered by Razorpay (Test Mode — no real payment)
                </p>
              </div>
            </div>
          </div>

          {/* Right: order summary */}
          <div>
            <div className="card">
              <div className="card-body">
                <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Order Summary</h3>
                <div className="summary-box">
                  {items.map((item) => (
                    <div key={item.cartItemId} className="summary-row">
                      <span>{item.foodName} × {item.quantity}</span>
                      <span>₹{item.subtotal}</span>
                    </div>
                  ))}
                  <div className="summary-row">
                    <span>Delivery fee</span>
                    <span style={{ color: 'var(--success)' }}>Free</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                {error && <div className="alert alert-error mt-2">{error}</div>}

                <button
                  className="btn btn-primary w-100 mt-2"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? 'Processing…' : `Pay ₹${total} via Razorpay`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
