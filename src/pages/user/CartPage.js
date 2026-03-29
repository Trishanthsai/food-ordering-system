// src/pages/user/CartPage.js
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const { cart, cartLoading, fetchCart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleQtyChange = async (cartItemId, newQty) => {
    try {
      await updateItem(cartItemId, newQty);
    } catch (err) {
      alert(err.response?.data || 'Could not update quantity');
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      await removeItem(cartItemId);
    } catch (err) {
      alert('Could not remove item');
    }
  };

  if (cartLoading) return <><Navbar /><div className="loading">Loading cart…</div></>;

  const items = cart?.items || [];

  return (
    <div className="page">
      <Navbar />
      <div className="container page-body">
        <div className="page-header">
          <h1>Your Cart</h1>
          <p>{items.length} item{items.length !== 1 ? 's' : ''} in cart</p>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <h3>Your cart is empty</h3>
            <p>Browse the menu and add some items!</p>
            <Link to="/menu" className="btn btn-primary mt-2">Browse Menu</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
            {/* Cart items list */}
            <div className="card">
              <div className="card-body" style={{ padding: 0 }}>
                {items.map((item, idx) => (
                  <div
                    key={item.cartItemId}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '16px 20px',
                      borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none'
                    }}
                  >
                    {/* Image */}
                    {item.foodImageUrl ? (
                      <img
                        src={item.foodImageUrl}
                        alt={item.foodName}
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }}
                      />
                    ) : (
                      <div style={{ width: 60, height: 60, background: '#f0f0ee', borderRadius: 6,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: '#bbb' }}>No img</div>
                    )}

                    {/* Name & price */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{item.foodName}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>₹{item.price} each</div>
                    </div>

                    {/* Quantity controls */}
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => handleQtyChange(item.cartItemId, item.quantity - 1)}
                      >−</button>
                      <span className="qty-val">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        disabled={item.quantity >= item.availableStock}
                        onClick={() => handleQtyChange(item.cartItemId, item.quantity + 1)}
                      >+</button>
                    </div>

                    {/* Subtotal */}
                    <div style={{ minWidth: 70, textAlign: 'right', fontWeight: 700 }}>
                      ₹{item.subtotal}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(item.cartItemId)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: 18, padding: '0 4px' }}
                      title="Remove"
                    >×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order summary */}
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
                    <div className="summary-row total">
                      <span>Total</span>
                      <span>₹{cart.totalAmount}</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary w-100 mt-2"
                    onClick={() => navigate('/checkout')}
                  >
                    Proceed to Checkout
                  </button>
                  <Link to="/menu" style={{ display: 'block', textAlign: 'center',
                    fontSize: 13, marginTop: 10, color: 'var(--text-muted)' }}>
                    ← Continue shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
