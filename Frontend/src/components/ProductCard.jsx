import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';

export const ProductCard = ({ product, onViewDetails }) => {
  const { user } = useAuth();
  const { addToCart, getCartDetails } = useDatabase();

  const isDiscounted = product.discountPercentage > 0;
  const isLowStock = product.stock <= 5 && product.stock > 0;
  const isOutOfStock = product.stock === 0;

  // Retrieve current user cart information
  const cartInfo = user ? getCartDetails(user.username) : { items: [] };
  const isInCart = cartInfo.items.some(item => item.id === product.id);
  const cartItem = cartInfo.items.find(item => item.id === product.id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  return (
    <article className="product-item-card animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Flat Graphic Header */}
      <div style={{
        height: '140px',
        background: '#f8fafc',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              padding: '8px'
            }} 
          />
        ) : (
          /* Large Category Emoji */
          <div style={{
            fontSize: '2.8rem',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
          }}>
            {product.categoryId === 'cat-laptops' && '💻'}
            {product.categoryId === 'cat-smartphones' && '📱'}
            {product.categoryId === 'cat-accessories' && '🎧'}
            {product.categoryId === 'cat-storage' && '💾'}
            {product.categoryId === 'cat-cameras' && '📷'}
            {product.categoryId === 'cat-fashion' && '👕'}
            {product.categoryId === 'cat-home' && '🏡'}
            {product.categoryId === 'cat-books' && '📚'}
            {product.categoryId === 'cat-fitness' && '🏋️'}
            {product.categoryId === 'cat-groceries' && '🍎'}
          </div>
        )}

        {/* Discount Badge */}
        {isDiscounted && (
          <span className="badge badge-danger" style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            fontSize: '0.68rem',
            fontWeight: '700'
          }}>
            🏷️ SAVE {product.discountPercentage}%
          </span>
        )}

        {/* Stock Badge */}
        <div style={{ position: 'absolute', bottom: '8px', right: '8px' }}>
          {isOutOfStock && <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Out of Stock</span>}
          {isLowStock && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Low Stock</span>}
          {!isOutOfStock && !isLowStock && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Active Stock</span>}
        </div>
      </div>

      {/* Card Content Details */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {product.brand}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            ⭐ {product.rating}
          </span>
        </div>

        <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '700', lineHeight: '1.3', minHeight: '38px', margin: 0 }}>
          {product.name}
        </h3>

        {/* Tag badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '2px 0' }}>
          {product.tags && product.tags.slice(0, 3).map(tag => (
            <span key={tag} className="badge badge-blue" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
              #{tag}
            </span>
          ))}
        </div>

        {/* Price Tag & Shopping cart actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
          marginTop: 'auto',
          paddingTop: '8px',
          borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            {isDiscounted && (
              <span style={{ fontSize: '0.72rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                ${product.originalPrice}
              </span>
            )}
            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              ${product.price}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px', width: '100%', justifyContent: 'flex-end' }}>
            <button
              onClick={() => onViewDetails(product.id)}
              className="btn btn-secondary"
              style={{
                padding: '8px 10px',
                fontSize: '0.8rem',
                fontWeight: '700',
                flexGrow: user && user.role !== 'admin' ? 1 : 2
              }}
            >
              🔎 Info
            </button>
            {user && user.role !== 'admin' && (
              <button
                onClick={() => addToCart(product.id, user.username)}
                disabled={isOutOfStock}
                className="btn btn-primary"
                style={{
                  padding: '8px 10px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  flexGrow: 2,
                  background: isInCart ? 'var(--alert-success)' : 'var(--accent-blue)',
                  borderColor: isInCart ? 'var(--alert-success)' : 'var(--accent-blue)',
                  color: '#ffffff'
                }}
              >
                {isInCart ? `🛒 Added (${cartQuantity})` : isOutOfStock ? 'Sold Out' : '🛒 Add'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
