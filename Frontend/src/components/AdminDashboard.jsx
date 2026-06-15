import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';

export const AdminDashboard = ({ onViewDetails }) => {
  const { usersRegistry } = useAuth();
  const {
    products,
    categories,
    getCatalog,
    addProduct,
    updateProduct,
    deleteProduct,
    searchCount,
    addCategory,
    updateCategory,
    deleteCategory
  } = useDatabase();

  const [activeSubTab, setActiveSubTab] = useState('products'); // 'products', 'categories', 'users'
  
  // Category CRUD Form states
  const [catEditing, setCatEditing] = useState(false);
  const [currentCatId, setCurrentCatId] = useState(null);
  const [catFormData, setCatFormData] = useState({
    name: '',
    icon: ''
  });
  const [catSuccessMsg, setCatSuccessMsg] = useState('');
  const [catErrorMsg, setCatErrorMsg] = useState('');
  
  // CRUD Form states
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    categoryId: 'cat-laptops',
    price: '',
    discountPercentage: '0',
    stockQuantity: '',
    warehouseLocation: 'WH-East-A1',
    longDescription: '',
    keyFeatures: '',
    technicalSpecs: '',
    tags: '',
    image: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const catalog = getCatalog();

  const handleStartEdit = (pId) => {
    const p = catalog.find(item => item.id === pId);
    if (!p) return;

    setCurrentEditId(pId);
    setFormData({
      name: p.name,
      brand: p.brand,
      categoryId: p.categoryId,
      price: p.originalPrice.toString(),
      discountPercentage: p.discountPercentage.toString(),
      stockQuantity: p.stock.toString(),
      warehouseLocation: p.warehouse,
      longDescription: p.longDescription,
      keyFeatures: p.keyFeatures.join(', '),
      technicalSpecs: Object.entries(p.technicalSpecs).map(([k, v]) => `${k}:${v}`).join(', '),
      tags: p.tags.join(', '),
      image: p.image || ''
    });
    setIsEditing(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    const formEl = document.getElementById('admin-crud-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentEditId(null);
    setFormData({
      name: '',
      brand: '',
      categoryId: 'cat-laptops',
      price: '',
      discountPercentage: '0',
      stockQuantity: '',
      warehouseLocation: 'WH-East-A1',
      longDescription: '',
      keyFeatures: '',
      technicalSpecs: '',
      tags: '',
      image: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const {
      name, brand, categoryId, price, discountPercentage,
      stockQuantity, warehouseLocation, longDescription,
      keyFeatures, technicalSpecs, tags, image
    } = formData;

    if (!name || !brand || !price || !stockQuantity) {
      setErrorMsg('Please enter Name, Brand, Price, and Stock Level fields.');
      return;
    }

    const specObject = {};
    if (technicalSpecs.trim()) {
      technicalSpecs.split(',').forEach(item => {
        const parts = item.split(':');
        if (parts.length >= 2) {
          specObject[parts[0].trim()] = parts.slice(1).join(':').trim();
        }
      });
    }

    const featureArray = keyFeatures.split(',').map(f => f.trim()).filter(Boolean);
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);

    const productPayload = {
      name,
      brand,
      categoryId,
      price: parseFloat(price),
      discountPercentage: parseInt(discountPercentage || 0),
      stockQuantity: parseInt(stockQuantity),
      warehouseLocation,
      imageColor: '#' + Math.floor(Math.random()*16777215).toString(16),
      image: image.trim()
    };

    const descPayload = {
      longDescription,
      keyFeatures: featureArray,
      technicalSpecs: specObject
    };

    if (isEditing) {
      updateProduct(currentEditId, productPayload, descPayload, tagArray).then(res => {
        if (res && res.success) {
          setSuccessMsg(`Successfully updated product "${name}"!`);
          handleCancelEdit();
        } else {
          setErrorMsg(res?.error || 'Failed to update product.');
        }
      });
    } else {
      addProduct(productPayload, descPayload, tagArray).then(res => {
        if (res && res.success) {
          setSuccessMsg(`Successfully created product "${name}"!`);
          setFormData({
            name: '',
            brand: '',
            categoryId: 'cat-laptops',
            price: '',
            discountPercentage: '0',
            stockQuantity: '',
            warehouseLocation: 'WH-East-A1',
            longDescription: '',
            keyFeatures: '',
            technicalSpecs: '',
            tags: '',
            image: ''
          });
        } else {
          setErrorMsg(res?.error || 'Failed to create product.');
        }
      });
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Execute cascading deletion for "${name}"?`)) {
      setErrorMsg('');
      setSuccessMsg('');
      deleteProduct(id).then(res => {
        if (res && res.success) {
          setSuccessMsg(`Successfully deleted product "${name}"!`);
        } else {
          setErrorMsg(res?.error || 'Failed to delete product.');
        }
      });
    }
  };

  // Category CRUD handlers
  const handleCatSubmit = (e) => {
    e.preventDefault();
    setCatSuccessMsg('');
    setCatErrorMsg('');

    if (!catFormData.name || !catFormData.icon) {
      setCatErrorMsg('Please enter both Name and Icon Emoji.');
      return;
    }

    if (catEditing) {
      updateCategory(currentCatId, catFormData.name, catFormData.icon);
      setCatSuccessMsg(`Successfully updated category to "${catFormData.name}"!`);
      setCatEditing(false);
      setCurrentCatId(null);
      setCatFormData({ name: '', icon: '' });
    } else {
      const newId = addCategory(catFormData.name, catFormData.icon);
      setCatSuccessMsg(`Successfully created category "${catFormData.name}"!`);
      setCatFormData({ name: '', icon: '' });
    }
  };

  const handleStartCatEdit = (cat) => {
    setCatEditing(true);
    setCurrentCatId(cat.id);
    setCatFormData({
      name: cat.name,
      icon: cat.icon
    });
  };

  const handleCancelCatEdit = () => {
    setCatEditing(false);
    setCurrentCatId(null);
    setCatFormData({ name: '', icon: '' });
  };

  const handleCatDelete = (id, name) => {
    if (window.confirm(`Delete Category "${name}"? WARNING: This will cascade and delete ALL products associated with this category. This action is permanent.`)) {
      deleteCategory(id);
      setCatSuccessMsg(`Successfully deleted category "${name}" and all its products.`);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '4px' }}>🛡️ Admin Dashboard</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Manage products, category catalogs, and monitor registered student profiles.
        </p>
      </div>

      {/* Analytics Statistics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '4px' }}>
        <div className="card-panel" style={{ padding: '16px', background: '#f8fafc', textAlign: 'center', boxShadow: 'none', border: '1px solid #cbd5e1' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>📦 Total Products</span>
          <h3 style={{ fontSize: '1.6rem', color: 'var(--accent-blue)', margin: '6px 0 0 0', fontWeight: '800' }}>{products.length}</h3>
        </div>
        <div className="card-panel" style={{ padding: '16px', background: '#f8fafc', textAlign: 'center', boxShadow: 'none', border: '1px solid #cbd5e1' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>📂 Total Categories</span>
          <h3 style={{ fontSize: '1.6rem', color: 'var(--accent-blue)', margin: '6px 0 0 0', fontWeight: '800' }}>{categories.length}</h3>
        </div>
        <div className="card-panel" style={{ padding: '16px', background: '#f8fafc', textAlign: 'center', boxShadow: 'none', border: '1px solid #cbd5e1' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>⚠️ Low Stock Items</span>
          <h3 style={{ fontSize: '1.6rem', color: 'var(--alert-warning)', margin: '6px 0 0 0', fontWeight: '800' }}>{catalog.filter(p => p.stock <= 5 && p.stock > 0).length}</h3>
        </div>
        <div className="card-panel" style={{ padding: '16px', background: '#f8fafc', textAlign: 'center', boxShadow: 'none', border: '1px solid #cbd5e1' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>❌ Out of Stock</span>
          <h3 style={{ fontSize: '1.6rem', color: 'var(--alert-danger)', margin: '6px 0 0 0', fontWeight: '800' }}>{catalog.filter(p => p.stock === 0).length}</h3>
        </div>
        <div className="card-panel" style={{ padding: '16px', background: '#f8fafc', textAlign: 'center', boxShadow: 'none', border: '1px solid #cbd5e1' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>🔍 User Searches</span>
          <h3 style={{ fontSize: '1.6rem', color: 'var(--accent-purple)', margin: '6px 0 0 0', fontWeight: '800' }}>{searchCount || 0}</h3>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="card-panel" style={{ display: 'flex', gap: '8px', padding: '8px 12px', width: 'fit-content' }}>
        <button
          onClick={() => { setActiveSubTab('products'); setErrorMsg(''); setSuccessMsg(''); setCatSuccessMsg(''); setCatErrorMsg(''); }}
          className={`btn ${activeSubTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: '700' }}
        >
          📂 Product Listings &amp; Inventory
        </button>
        <button
          onClick={() => { setActiveSubTab('categories'); setErrorMsg(''); setSuccessMsg(''); setCatSuccessMsg(''); setCatErrorMsg(''); }}
          className={`btn ${activeSubTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: '700' }}
        >
          🏷️ Category Management
        </button>
        <button
          onClick={() => { setActiveSubTab('users'); setErrorMsg(''); setSuccessMsg(''); setCatSuccessMsg(''); setCatErrorMsg(''); }}
          className={`btn ${activeSubTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: '700' }}
        >
          👥 Registered Accounts
        </button>
      </div>

      {/* Notices */}
      {successMsg && (
        <div style={{
          background: 'var(--alert-success-bg)',
          border: '1px solid #a7f3d0',
          color: 'var(--alert-success)',
          padding: '10px 14px',
          borderRadius: '6px',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}>
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{
          background: 'var(--alert-danger-bg)',
          border: '1px solid #fca5a5',
          color: 'var(--alert-danger)',
          padding: '10px 14px',
          borderRadius: '6px',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* SUBTAB 1: PRODUCT LISTINGS CRUD */}
      {activeSubTab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Listings Table */}
          <div className="card-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '700' }}>Active Product Listings</h4>
            </div>

            <div className="custom-table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product details</th>
                    <th>Base Price</th>
                    <th>Stock Details</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {catalog.map(prod => (
                    <tr key={prod.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '4px',
                            background: prod.imageColor || '#eff6ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            fontSize: '0.7rem',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            flexShrink: 0
                          }}>
                            {prod.image ? (
                              <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span>{prod.name.substring(0,1).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <span style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem' }}>{prod.name}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                              ID: {prod.id} | {prod.brand}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: '700' }}>${prod.price}</span>
                        {prod.discountPercentage > 0 && (
                          <span className="badge badge-danger" style={{ fontSize: '0.6rem', padding: '1px 4px', marginLeft: '4px' }}>
                            -{prod.discountPercentage}%
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          fontWeight: '600',
                          color: prod.stock <= 5 ? 'var(--alert-warning)' : 'var(--text-primary)'
                        }}>
                          {prod.stock} units
                        </span>
                        <span style={{ fontSize: '0.68rem', display: 'block', color: 'var(--text-secondary)' }}>
                          Loc: {prod.warehouse}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleStartEdit(prod.id)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="btn btn-danger"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ADD / EDIT FORM */}
          <div id="admin-crud-form" className="card-panel">
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: '700' }}>
              {isEditing ? '✏️ Edit Product' : '➕ Add New Product'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Creator Note 15"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Brand *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="input-field"
                    placeholder="e.g. SlimTech"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    placeholder="999.00"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Discount Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                    className="input-field"
                    placeholder="10"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="input-field"
                    placeholder="50"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Warehouse Code</label>
                  <input
                    type="text"
                    value={formData.warehouseLocation}
                    onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                    className="input-field"
                    placeholder="WH-West-A1"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="select-field"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Custom Image URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com/image.png"
                  />
                </div>
              </div>

              <hr style={{ border: 'none', borderBottom: '1px solid #cbd5e1', margin: '4px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                  Product Description
                </label>
                <textarea
                  rows="2"
                  value={formData.longDescription}
                  onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                  className="input-field"
                  placeholder="Enter detailed description..."
                  style={{ resize: 'vertical', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                  Highlights comma-separated (KeyFeatures)
                </label>
                <input
                  type="text"
                  value={formData.keyFeatures}
                  onChange={(e) => setFormData({ ...formData, keyFeatures: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 16GB RAM, Fast CPU"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                  Specs Key:Value comma-separated
                </label>
                <input
                  type="text"
                  value={formData.technicalSpecs}
                  onChange={(e) => setFormData({ ...formData, technicalSpecs: e.target.value })}
                  className="input-field"
                  placeholder="e.g. RAM:16GB, CPU:i7"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                  Search Keywords / Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="input-field"
                  placeholder="e.g. fashion, bag, leather"
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                {isEditing ? (
                  <>
                    <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, fontSize: '0.85rem' }}>
                      💾 Save Update
                    </button>
                    <button type="button" onClick={handleCancelEdit} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, padding: '11px', fontSize: '0.85rem' }}>
                    ➕ Add Product
                  </button>
                )}
              </div>
            </form>
          </div>

        </div>
      )}

      {/* SUBTAB 2: REGISTERED USERS DIRECTORY */}
      {activeSubTab === 'users' && (
        <div className="card-panel animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '700' }}>
              👤 Registered User Accounts
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Listing all registered user profiles.
            </p>
          </div>

          <div className="custom-table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Username Name</th>
                  <th>Contact Email</th>
                  <th>Registered Role</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {usersRegistry.map(regUser => {
                  return (
                    <tr key={regUser.username}>
                      <td style={{ fontWeight: '700' }}>👤 {regUser.username}</td>
                      <td>{regUser.email}</td>
                      <td>
                        <span className={`badge ${regUser.role === 'admin' ? 'badge-danger' : 'badge-blue'}`}>
                          {regUser.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(regUser.registeredAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CATEGORY MANAGEMENT */}
      {activeSubTab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Categories list */}
          <div className="card-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '700' }}>Active Categories</h4>
            </div>

            <div className="custom-table-container" style={{ border: 'none' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Category ID</th>
                    <th>Icon</th>
                    <th>Name</th>
                    <th>Product Count</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => {
                    const count = products.filter(p => p.categoryId === cat.id).length;
                    return (
                      <tr key={cat.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{cat.id}</td>
                        <td style={{ fontSize: '1.2rem' }}>{cat.icon}</td>
                        <td style={{ fontWeight: '700', fontSize: '0.85rem' }}>{cat.name}</td>
                        <td>
                          <span className="badge badge-blue">{count} products</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleStartCatEdit(cat)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleCatDelete(cat.id, cat.name)}
                              className="btn btn-danger"
                              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            >
                              🗑️ Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Add/Edit Form */}
          <div className="card-panel">
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: '700' }}>
              {catEditing ? '✏️ Edit Category' : '➕ Add New Category'}
            </h3>

            {catSuccessMsg && (
              <div style={{ background: 'var(--alert-success-bg)', color: 'var(--alert-success)', border: '1px solid #a7f3d0', padding: '8px 12px', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '10px', fontWeight: '600' }}>
                ✅ {catSuccessMsg}
              </div>
            )}
            {catErrorMsg && (
              <div style={{ background: 'var(--alert-danger-bg)', color: 'var(--alert-danger)', border: '1px solid #fca5a5', padding: '8px 12px', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '10px', fontWeight: '600' }}>
                ⚠️ {catErrorMsg}
              </div>
            )}

            <form onSubmit={handleCatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Category Name *</label>
                <input
                  type="text"
                  value={catFormData.name}
                  onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Smart Home"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Icon Emoji *</label>
                <input
                  type="text"
                  value={catFormData.icon}
                  onChange={(e) => setCatFormData({ ...catFormData, icon: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 🔌"
                  maxLength="4"
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {catEditing ? (
                  <>
                    <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, fontSize: '0.85rem' }}>
                      💾 Save
                    </button>
                    <button type="button" onClick={handleCancelCatEdit} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, padding: '10px', fontSize: '0.85rem' }}>
                    ➕ Add Category
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
