import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';

export const ProfileView = ({ setCurrentTab }) => {
  const { user, changePassword, updateProfile, logout } = useAuth();
  const { products, categories, searchCount, adminStats, recentActivities, orders, getCatalog } = useDatabase();

  const catalog = getCatalog();
  const lowStockCount = catalog.filter(p => p.stock <= 5 && p.stock > 0).length;

  // Account Settings state
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notice messages states
  const [infoSuccess, setInfoSuccess] = useState('');
  const [infoError, setInfoError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const lastLoginFormatted = new Date().toLocaleDateString(undefined, { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }) + ' ' + new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  // Handle email/profile update
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setInfoSuccess('');
    setInfoError('');

    if (!emailInput.trim() || !emailInput.includes('@')) {
      setInfoError('Please enter a valid email address.');
      return;
    }

    const res = updateProfile(user.username, emailInput.trim());
    if (res.success) {
      setInfoSuccess('Profile information updated successfully!');
    } else {
      setInfoError('Failed to update profile information.');
    }
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPassSuccess('');
    setPassError('');

    if (newPassword.length < 4) {
      setPassError('Password must be at least 4 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('Passwords do not match.');
      return;
    }

    const res = changePassword(user.username, newPassword);
    if (res.success) {
      setPassSuccess('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassError('Failed to change password.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Title */}
      <div>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
          {isAdmin ? '🛡️ Administrator Control Profile' : '👤 Customer Account Profile'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {isAdmin 
            ? 'Monitor system resource metrics, audit logs, and manage account credentials.' 
            : 'View your profile details, purchase stats, and update account settings.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1.5fr 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Main Profile Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Section 1: User Identity Card */}
          <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: isAdmin ? 'var(--accent-purple)' : 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>
                  {user.username}
                </h4>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Registered Email: {user.email || `${user.username}@clickcart.io`}
                </span>
              </div>
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Role Badge</span>
                <span style={{ fontSize: '0.92rem', fontWeight: '700' }}>
                  <span className={`badge ${isAdmin ? 'badge-purple' : 'badge-blue'}`} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                    {isAdmin ? '🛡️ Administrator' : '👤 Customer'}
                  </span>
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                  {isAdmin ? 'Admin Identifier' : 'User Account ID'}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                  {isAdmin ? `ADM-${user.username.toUpperCase()}-099` : `USR-${user.username.toUpperCase()}-742`}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Session Last Login</span>
                <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {lastLoginFormatted}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Role Specific Stats */}
          {isAdmin ? (
            /* Admin Stats: Products Managed */
            <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🛡️ Product Management Audit Summary
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', display: 'block', textTransform: 'uppercase' }}>Managed</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-blue)' }}>{products.length}</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', display: 'block', textTransform: 'uppercase' }}>Added</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--alert-success)' }}>{adminStats.added}</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', display: 'block', textTransform: 'uppercase' }}>Updated</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{adminStats.updated}</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '700', display: 'block', textTransform: 'uppercase' }}>Deleted</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--alert-danger)' }}>{adminStats.deleted}</span>
                </div>
              </div>
            </div>
          ) : (
            /* User Stats: Order Summary */
            <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🛒 Order History &amp; Activity
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>Orders Placed</span>
                  <h5 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-blue)', marginTop: '4px' }}>
                    {orders.filter(o => o.username === user.username).length}
                  </h5>
                </div>
                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>Total Expenditure</span>
                  <h5 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--alert-success)', marginTop: '4px' }}>
                    ${orders.filter(o => o.username === user.username).reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                  </h5>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Interactive Account Settings Forms */}
          <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⚙️ Account Settings
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              
              {/* Form A: Update Profile Info */}
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>Update Profile Info</h5>
                
                {infoSuccess && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--alert-success)', fontWeight: '600' }}>✅ {infoSuccess}</span>
                )}
                {infoError && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--alert-danger)', fontWeight: '600' }}>⚠️ {infoError}</span>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Change Contact Email</label>
                  <input 
                    type="email" 
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="input-field" 
                    placeholder="newemail@domain.com"
                    style={{ fontSize: '0.82rem', padding: '8px 12px' }}
                  />
                </div>
                <button type="submit" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem', width: 'fit-content' }}>
                  Save Profile Info
                </button>
              </form>

              {/* Form B: Change Password */}
              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>Change Account Password</h5>
                
                {passSuccess && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--alert-success)', fontWeight: '600' }}>✅ {passSuccess}</span>
                )}
                {passError && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--alert-danger)', fontWeight: '600' }}>⚠️ {passError}</span>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field" 
                    placeholder="Min 4 characters"
                    style={{ fontSize: '0.82rem', padding: '8px 12px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Confirm Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field" 
                    placeholder="Verify password"
                    style={{ fontSize: '0.82rem', padding: '8px 12px' }}
                  />
                </div>
                <button type="submit" className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem', width: 'fit-content' }}>
                  Change Password
                </button>
              </form>
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid #cbd5e1' }} />
            
            <button 
              onClick={logout}
              className="btn btn-danger" 
              style={{ width: 'fit-content', padding: '8px 16px', fontSize: '0.85rem' }}
            >
              🚪 Logout from Profile
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Admin Panels (Only for Admins) */}
        {isAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Quick Actions Panel */}
            <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ⚡ Quick Actions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={() => setCurrentTab('admin')} 
                  className="btn btn-primary" 
                  style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.8rem', width: '100%' }}
                >
                  ➕ Add New Product
                </button>
                <button 
                  onClick={() => setCurrentTab('admin')} 
                  className="btn btn-secondary" 
                  style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.8rem', width: '100%' }}
                >
                  📦 Manage Inventory
                </button>
                <button 
                  onClick={() => setCurrentTab('admin')} 
                  className="btn btn-secondary" 
                  style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.8rem', width: '100%' }}
                >
                  🏷️ Manage Categories
                </button>
              </div>
            </div>

            {/* System Summary Metrics */}
            <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                📊 System Metrics Summary
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Products Catalog</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{products.length} items</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Active Catalog Categories</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{categories.length} categories</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: lowStockCount > 0 ? '600' : 'normal' }}>
                    Low Stock Alert (&le; 5 units)
                  </span>
                  <span style={{ fontWeight: '700', color: lowStockCount > 0 ? 'var(--alert-warning)' : 'var(--text-primary)' }}>
                    ⚠️ {lowStockCount} items
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Customer Searches</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>🔍 {searchCount} searches</span>
                </div>
              </div>
            </div>

            {/* Audit activities log */}
            <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                📋 Recent Activity Logs
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                {recentActivities.length === 0 ? (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
                    No recent database operations logged.
                  </span>
                ) : (
                  recentActivities.map((act) => (
                    <div 
                      key={act.id} 
                      style={{ 
                        padding: '8px', 
                        background: '#f8fafc', 
                        borderRadius: '4px', 
                        borderLeft: '3px solid ' + (
                          act.type.includes('delete') ? 'var(--alert-danger)' : 
                          act.type.includes('add') ? 'var(--alert-success)' : 'var(--accent-blue)'
                        ),
                        fontSize: '0.76rem' 
                      }}
                    >
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>{act.text}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {new Date(act.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
