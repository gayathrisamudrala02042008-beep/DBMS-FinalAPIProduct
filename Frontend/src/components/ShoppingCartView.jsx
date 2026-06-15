import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';

export const ShoppingCartView = ({ setCurrentTab, onViewDetails }) => {
  const { user } = useAuth();
  const { getCartDetails, updateCartQuantity, removeFromCart } = useDatabase();

  const { items, total } = user ? getCartDetails(user.username) : { items: [], total: 0 };
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleQtyChange = (productId, change) => {
    const item = items.find(i => i.id === productId);
    if (!item) return;
    updateCartQuantity(productId, item.quantity + change, user.username);
  };

  const handleRemove = (productId, name) => {
    if (window.confirm(`Remove "${name}" from your cart?`)) {
      removeFromCart(productId, user.username);
    }
  };

  return (
    <div className="card-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '4px' }}>🛒 My Shopping Cart</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Review and manage products you have added to your catalog list.</p>
        </div>
        <button 
          onClick={() => setCurrentTab('catalog')} 
          className="btn btn-secondary" 
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
        >
          📂 Browse More Products
        </button>
      </div>

      <hr style={{ border: 'none', borderBottom: '1px solid #cbd5e1' }} />

      {items.length === 0 ? (
        <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛒</div>
          <h4 style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Your shopping cart is empty</h4>
          <p style={{ fontSize: '0.8rem', maxWidth: '320px', margin: '0 auto 16px auto' }}>
            No products have been added yet. Go to the products catalog tab to discover items!
          </p>
          <button 
            onClick={() => setCurrentTab('catalog')} 
            className="btn btn-primary" 
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            Go to Products Catalog
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Cart Table */}
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product Information</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '4px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          flexShrink: 0
                        }}>
                          {item.image ? (
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            <span>
                              {item.categoryId === 'cat-laptops' && '💻'}
                              {item.categoryId === 'cat-smartphones' && '📱'}
                              {item.categoryId === 'cat-accessories' && '🎧'}
                              {item.categoryId === 'cat-storage' && '💾'}
                              {item.categoryId === 'cat-cameras' && '📷'}
                              {item.categoryId === 'cat-fashion' && '👕'}
                              {item.categoryId === 'cat-home' && '🏡'}
                              {item.categoryId === 'cat-books' && '📚'}
                              {item.categoryId === 'cat-fitness' && '🏋️'}
                              {item.categoryId === 'cat-groceries' && '🍎'}
                            </span>
                          )}
                        </div>
                        <div>
                          <span 
                            onClick={() => onViewDetails(item.id)}
                            style={{ display: 'block', fontWeight: '700', fontSize: '0.85rem', color: 'var(--accent-blue)', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            {item.name}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Brand: {item.brand}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600' }}>${item.price}</span>
                      {item.discountPercentage > 0 && (
                        <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--alert-danger)' }}>
                          -{item.discountPercentage}% Discount
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => handleQtyChange(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="btn btn-secondary" 
                          style={{ padding: '2px 8px', fontSize: '0.75rem', minWidth: '24px' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.88rem', fontWeight: '700', minWidth: '16px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => handleQtyChange(item.id, 1)}
                          className="btn btn-secondary" 
                          style={{ padding: '2px 8px', fontSize: '0.75rem', minWidth: '24px' }}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                        ${item.subtotal.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleRemove(item.id, item.name)}
                        className="btn btn-danger" 
                        style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                      >
                        ✕ Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cart Summary Metrics Card */}
          <div className="card-panel" style={{ background: '#f8fafc', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>
                  Total Items
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {totalQuantity} units
                </span>
              </div>
              <div style={{ width: '1px', height: '36px', background: '#cbd5e1' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>
                  Total Price
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-blue)' }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '600', padding: '6px 12px', background: '#eff6ff', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
              🔒 Mini-Project Mode: No purchase required.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
