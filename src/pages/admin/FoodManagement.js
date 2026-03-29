// src/pages/admin/FoodManagement.js
import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/common/AdminSidebar';
import { getFoods, addFood, updateFood, deleteFood, updateStock } from '../../services/api';

const EMPTY_FORM = {
  name: '', description: '', price: '', stock: '', imageUrl: '', category: ''
};

const FoodManagement = () => {
  const [foods, setFoods]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]  = useState(null); // null = adding new
  const [form, setForm]          = useState(EMPTY_FORM);
  const [stockEdits, setStockEdits] = useState({}); // { foodId: newStock }
  const [error, setError]        = useState('');
  const [saving, setSaving]      = useState(false);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const res = await getFoods();
      setFoods(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFoods(); }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (food) => {
    setEditItem(food);
    setForm({
      name: food.name, description: food.description || '',
      price: food.price, stock: food.stock,
      imageUrl: food.imageUrl || '', category: food.category
    });
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
      if (editItem) {
        await updateFood(editItem.foodId, payload);
      } else {
        await addFood(payload);
      }
      setShowModal(false);
      fetchFoods();
    } catch (err) {
      setError(err.response?.data || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food item?')) return;
    try {
      await deleteFood(id);
      fetchFoods();
    } catch (err) {
      alert(err.response?.data || 'Delete failed');
    }
  };

  const handleUpdateStock = async (foodId) => {
    const newStock = stockEdits[foodId];
    if (newStock === undefined || newStock === '') return;
    try {
      await updateStock(foodId, parseInt(newStock));
      setStockEdits({ ...stockEdits, [foodId]: undefined });
      fetchFoods();
    } catch (err) {
      alert(err.response?.data || 'Stock update failed');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <div className="flex-between page-header">
          <div>
            <h1>Food Management</h1>
            <p>Add, edit, delete food items and manage stock</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Food Item</button>
        </div>

        {loading ? (
          <div className="loading">Loading foods…</div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Update Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map((food) => (
                    <tr key={food.foodId}>
                      <td>
                        {food.imageUrl
                          ? <img src={food.imageUrl} alt={food.name}
                              style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                          : <div style={{ width: 48, height: 48, background: '#f0f0ee',
                              borderRadius: 6, display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: 10, color: '#bbb' }}>No img</div>
                        }
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{food.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {food.description?.slice(0, 50)}{food.description?.length > 50 ? '…' : ''}
                        </div>
                      </td>
                      <td><span style={{ fontSize: 12 }}>{food.category}</span></td>
                      <td style={{ fontWeight: 700 }}>₹{food.price}</td>
                      <td>
                        <span style={{
                          color: food.stock === 0 ? 'var(--danger)'
                            : food.stock < 5 ? 'var(--warning)' : 'inherit',
                          fontWeight: 600
                        }}>
                          {food.stock}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            style={{ width: 70, padding: '5px 8px' }}
                            placeholder={food.stock}
                            value={stockEdits[food.foodId] ?? ''}
                            onChange={(e) =>
                              setStockEdits({ ...stockEdits, [food.foodId]: e.target.value })}
                          />
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleUpdateStock(food.foodId)}
                            disabled={!stockEdits[food.foodId]}
                          >
                            Set
                          </button>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm"
                            onClick={() => openEdit(food)}>Edit</button>
                          <button className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(food.foodId)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editItem ? 'Edit Food Item' : 'Add Food Item'}</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  {error && <div className="alert alert-error">{error}</div>}
                  <div className="form-group">
                    <label>Name</label>
                    <input className="form-control" name="name" value={form.name}
                      onChange={handleChange} required placeholder="e.g. Butter Chicken" />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-control" name="description" value={form.description}
                      onChange={handleChange} rows={2} placeholder="Short description…" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label>Price (₹)</label>
                      <input className="form-control" name="price" type="number" step="0.01"
                        value={form.price} onChange={handleChange} required placeholder="0.00" />
                    </div>
                    <div className="form-group">
                      <label>Stock</label>
                      <input className="form-control" name="stock" type="number"
                        value={form.stock} onChange={handleChange} required placeholder="0" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select className="form-control" name="category" value={form.category}
                      onChange={handleChange} required>
                      <option value="">Select category</option>
                      {['Starters','Main Course','Biryani','Pizza','Burgers','Desserts','Drinks'].map(c =>
                        <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Image URL</label>
                    <input className="form-control" name="imageUrl" value={form.imageUrl}
                      onChange={handleChange} placeholder="https://example.com/image.jpg" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline"
                    onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : editItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FoodManagement;
