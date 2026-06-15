import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';

export const ProductDetailModal = ({ productId, onClose, onSelectProduct }) => {
  const { user } = useAuth();
  const { getProductDetails, getCatalog, addToCart, getCartDetails } = useDatabase();

  const details = getProductDetails(productId);
  if (!details) return null;

  const cartInfo = user ? getCartDetails(user.username) : { items: [] };
  const isInCart = cartInfo.items.some(item => item.id === productId);
  const cartItem = cartInfo.items.find(item => item.id === productId);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const allProducts = getCatalog();
  const similarProducts = allProducts
    .filter(p => p.id !== productId && (p.categoryId === details.categoryId || p.brand === details.brand))
    .slice(0, 3);

  const isDiscounted = details.discountPercentage > 0;
  const isOutOfStock = details.stock === 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      {/* Modal Card */}
      <div className="animate-fade-in" style={{
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: 'var(--radius-lg)',
        background: '#ffffff',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid #cbd5e1',
        position: 'relative'
      }}>
        {/* Header Color Area */}
        <div style={{
          background: '#f8fafc',
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          position: 'relative'
        }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            ✕
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="badge badge-blue" style={{ width: 'fit-content' }}>
              {details.categoryName}
            </span>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', fontWeight: '800' }}>
              {details.name}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
              Brand: {details.brand} | Ratings: ⭐ {details.rating} / 5
            </span>
          </div>
        </div>

        {/* Content Body Grid */}
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
          
          {/* Left Column: Image/Visual representation & Tech Specs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              height: '220px',
              background: '#f8fafc',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {details.image ? (
                <img 
                  src={details.image} 
                  alt={details.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }} 
                />
              ) : (
                <div style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
                  {details.categoryId === 'cat-laptops' && '💻'}
                  {details.categoryId === 'cat-smartphones' && '📱'}
                  {details.categoryId === 'cat-accessories' && '🎧'}
                  {details.categoryId === 'cat-storage' && '💾'}
                  {details.categoryId === 'cat-cameras' && '📷'}
                  {details.categoryId === 'cat-fashion' && '👕'}
                  {details.categoryId === 'cat-home' && '🏡'}
                  {details.categoryId === 'cat-books' && '📚'}
                  {details.categoryId === 'cat-fitness' && '🏋️'}
                  {details.categoryId === 'cat-groceries' && '🍎'}
                </div>
              )}
            </div>

            {Object.keys(details.technicalSpecs || {}).length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Technical Specifications
                </h4>
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                  {Object.entries(details.technicalSpecs).map(([key, val], idx) => (
                    <div key={key} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      fontSize: '0.8rem',
                      background: idx % 2 === 0 ? '#f8fafc' : '#ffffff',
                      borderBottom: idx < Object.entries(details.technicalSpecs).length - 1 ? '1px solid #e2e8f0' : 'none'
                    }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{key}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Description & Stock details & Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Product Description
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                {details.longDescription}
              </p>
            </div>

            <div className="card-panel" style={{ padding: '16px', background: '#f8fafc' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Availability Status</span>
                  <span style={{ fontWeight: '700', color: isOutOfStock ? 'red' : 'var(--text-primary)' }}>
                    {isOutOfStock ? '❌ Out of Stock' : `📦 In Stock (${details.stock} units)`}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Warehouse Location</span>
                  <span style={{ fontWeight: '700' }}>📍 {details.warehouse}</span>
                </div>
              </div>
            </div>

            {details.keyFeatures && details.keyFeatures.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Core Highlights
                </h4>
                <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', paddingLeft: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {details.keyFeatures.map((feat, idx) => (
                    <li key={idx} style={{ marginBottom: '2px' }}>{feat}</li>
                  ))}
                </ul>
              </div>
            )}

            {details.tags && details.tags.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Tags
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {details.tags.map(tag => (
                    <span key={tag} className="badge badge-blue" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Similar Recommendations */}
        {similarProducts.length > 0 && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #cbd5e1',
            background: '#f8fafc'
          }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px' }}>
              ✨ You May Also Like
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {similarProducts.map((simProd) => (
                <div
                  key={simProd.id}
                  onClick={() => onSelectProduct(simProd.id)}
                  className="product-item-card"
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{
                      height: '80px',
                      background: '#f8fafc',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      marginBottom: '6px'
                    }}>
                      {simProd.image ? (
                        <img 
                          src={simProd.image} 
                          alt={simProd.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} 
                        />
                      ) : (
                        <span style={{ fontSize: '1.5rem' }}>
                          {simProd.categoryId === 'cat-laptops' && '💻'}
                          {simProd.categoryId === 'cat-smartphones' && '📱'}
                          {simProd.categoryId === 'cat-accessories' && '🎧'}
                          {simProd.categoryId === 'cat-storage' && '💾'}
                          {simProd.categoryId === 'cat-cameras' && '📷'}
                          {simProd.categoryId === 'cat-fashion' && '👕'}
                          {simProd.categoryId === 'cat-home' && '🏡'}
                          {simProd.categoryId === 'cat-books' && '📚'}
                          {simProd.categoryId === 'cat-fitness' && '🏋️'}
                          {simProd.categoryId === 'cat-groceries' && '🍎'}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                      {simProd.brand}
                    </span>
                    <h5 style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '2px 0 6px 0' }}>
                      {simProd.name}
                    </h5>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      ${simProd.price}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      ⭐ {simProd.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid #cbd5e1',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '10px',
          background: '#ffffff'
        }}>
          {user && user.role !== 'admin' && (
            <button
              onClick={() => addToCart(productId, user.username)}
              disabled={isOutOfStock}
              className="btn btn-success"
              style={{
                padding: '6px 16px',
                fontSize: '0.82rem',
                fontWeight: '700',
                background: isInCart ? 'var(--alert-success)' : 'var(--accent-blue)',
                borderColor: isInCart ? 'var(--alert-success)' : 'var(--accent-blue)'
              }}
            >
              {isInCart ? `🛒 Added to Cart (${cartQuantity})` : isOutOfStock ? '❌ Out of Stock' : '🛒 Add to Cart'}
            </button>
          )}
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '0.82rem' }}>
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
