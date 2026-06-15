import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const AuthPage = () => {
  const [activeMode, setActiveMode] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });

  const { login, signup, error, setError } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleToggleMode = () => {
    setActiveMode(activeMode === 'login' ? 'signup' : 'login');
    setError(null);
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (activeMode === 'login') {
      const res = await login(formData.username || formData.email, formData.password);
      if (res.success) {
        // Success logged in (context will update and App will route)
      }
    } else {
      const res = await signup(formData.username, formData.email, formData.password, formData.role);
      if (res.success) {
        setSuccessMessage('Account successfully created! Loading session...');
        setTimeout(() => {
          // Success handled in context
        }, 800);
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh',
      padding: '40px 10px'
    }}>
      <div className="card-panel" style={{
        maxWidth: '400px',
        width: '100%',
        padding: '30px',
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        boxShadow: 'var(--shadow-lg)'
      }}>
        
        {/* Banner header logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '6px',
            background: 'var(--accent-blue)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            color: '#ffffff',
            fontSize: '1.3rem',
            marginBottom: '10px'
          }}>
            C
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {activeMode === 'login' ? 'Sign In to ClickCart' : 'Create Account'}
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Authentication is required to discover products
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--alert-danger-bg)',
            border: '1px solid #fca5a5',
            color: 'var(--alert-danger)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            marginBottom: '16px',
            fontWeight: '600'
          }}>
            ⚠️ {error}
          </div>
        )}

        {successMessage && (
          <div style={{
            background: 'var(--alert-success-bg)',
            border: '1px solid #a7f3d0',
            color: 'var(--alert-success)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            marginBottom: '16px',
            fontWeight: '600'
          }}>
            ✅ {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
              Username or Registered Email *
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. admin1 or user1"
            />
          </div>

          {activeMode === 'signup' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g. name@mail.com"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                  Select Profile Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="select-field"
                >
                  <option value="user">👤 User Mode (Catalog browsing &amp; Shopping Cart)</option>
                  <option value="admin">🛡️ Admin Mode (Full Product CRUD &amp; User list)</option>
                </select>
              </div>
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
              Password *
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '0.9rem', fontWeight: '700' }}
          >
            {activeMode === 'login' ? '🔓 Secure Sign In' : '🚀 Register & Authenticate'}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '14px'
        }}>
          {activeMode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                onClick={handleToggleMode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-blue)',
                  cursor: 'pointer',
                  fontWeight: '700',
                  textDecoration: 'underline'
                }}
              >
                Sign Up Now
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                onClick={handleToggleMode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-blue)',
                  cursor: 'pointer',
                  fontWeight: '700',
                  textDecoration: 'underline'
                }}
              >
                Sign In
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
