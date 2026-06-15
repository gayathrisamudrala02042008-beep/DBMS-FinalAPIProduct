import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';

export const Navbar = ({ currentTab, setCurrentTab }) => {
  const { user } = useAuth();
  const { getCartCount } = useDatabase();

  const cartCount = user ? getCartCount(user.username) : 0;

  const getPageTitle = () => {
    switch (currentTab) {
      case 'catalog':
        return '🛍️ Products Catalog';
      case 'cart':
        return '🛒 Shopping Cart';
      case 'admin':
        return '🛡️ Admin Dashboard';
      case 'profile':
        return '👤 My Account Profile';
      default:
        return 'ClickCart';
    }
  };

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #cbd5e1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: '60px',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Dynamic Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h1 style={{
          fontSize: '1.1rem',
          fontWeight: '700',
          color: 'var(--text-primary)',
          margin: 0
        }}>
          {getPageTitle()}
        </h1>
      </div>

      {/* User Indicator / Cart */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Show cart shortcut button ONLY for users (non-admins) */}
            {user.role !== 'admin' && (
              <>
                <button
                  onClick={() => setCurrentTab('cart')}
                  style={{
                    background: 'none',
                    border: 'none',
                    position: 'relative',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title="View Cart"
                >
                  🛒
                  {cartCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: 'var(--alert-danger)',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      padding: '1px 5px',
                      borderRadius: '999px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      {cartCount}
                    </span>
                  )}
                </button>
                <div style={{ width: '1px', height: '18px', background: '#cbd5e1' }} />
              </>
            )}

            {/* Profile Pill */}
            <div 
              onClick={() => setCurrentTab('profile')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                cursor: 'pointer',
                background: '#f8fafc',
                padding: '4px 10px 4px 6px',
                borderRadius: '20px',
                border: '1px solid #cbd5e1'
              }}
              title="View Profile"
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: user.role === 'admin' ? 'var(--accent-purple)' : 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                color: '#ffffff',
                fontSize: '0.72rem'
              }}>
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {user.username}
              </span>
            </div>
          </div>
        ) : (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            🔒 Access Restricted
          </span>
        )}
      </div>
    </header>
  );
};
