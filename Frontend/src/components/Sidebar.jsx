import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({
  currentTab,
  setCurrentTab,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  inStockOnly,
  setInStockOnly,
  selectedBrands,
  setSelectedBrands,
  sortBy,
  setSortBy,
  resetAllFilters
}) => {
  const { categories, products, getCartCount } = useDatabase();
  const { user, logout } = useAuth();

  const cartCount = user ? getCartCount(user.username) : 0;
  const filteredProductsForBrands = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.categoryId === selectedCategory);
  const uniqueBrands = Array.from(new Set(filteredProductsForBrands.map(p => p.brand))).filter(Boolean);

  const handleBrandChange = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const handleNavAction = (action) => {
    if (action === 'catalog') {
      setCurrentTab('catalog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'search' || action === 'nl-search') {
      setCurrentTab('catalog');
      setTimeout(() => {
        const input = document.getElementById('catalog-search-input');
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else if (action === 'categories') {
      setCurrentTab('catalog');
      setTimeout(() => {
        const section = document.getElementById('categories-filter-section');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else if (action === 'filters') {
      setCurrentTab('catalog');
      setTimeout(() => {
        const section = document.getElementById('filters-section-title');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else if (action === 'cart') {
      setCurrentTab('cart');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'profile') {
      setCurrentTab('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'admin') {
      setCurrentTab('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <aside className="card-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      height: 'fit-content',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
      padding: '20px',
      position: 'sticky',
      top: '80px'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'var(--accent-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '800',
          color: '#ffffff',
          fontSize: '1.3rem'
        }}>
          C
        </div>
        <h2 style={{
          fontSize: '1.3rem',
          fontWeight: '800',
          color: 'var(--accent-blue)',
          margin: 0
        }}>
          ClickCart
        </h2>
      </div>

      <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0', margin: '0' }} />

      {/* User Profile Info Card */}
      {user && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: user.role === 'admin' ? 'var(--accent-purple)' : 'var(--accent-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              color: '#ffffff',
              fontSize: '0.9rem'
            }}>
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user.username}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user.email || `${user.username}@clickcart.io`}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span className={`badge ${user.role === 'admin' ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
              {user.role === 'admin' ? '🛡️ Admin' : '👤 User'}
            </span>
          </div>
        </div>
      )}

      <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0', margin: '0' }} />

      {/* Role-Based Navigation Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Navigation</h4>
        
        <button
          onClick={() => handleNavAction('catalog')}
          className={`btn ${currentTab === 'catalog' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', width: '100%' }}
        >
          🛍️ View Products
        </button>

        <button
          onClick={() => handleNavAction('search')}
          className="btn btn-secondary"
          style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', width: '100%' }}
        >
          🔍 Search Products
        </button>

        <button
          onClick={() => handleNavAction('filters')}
          className="btn btn-secondary"
          style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', width: '100%' }}
        >
          🎛️ Filter Products
        </button>

        <button
          onClick={() => handleNavAction('categories')}
          className="btn btn-secondary"
          style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', width: '100%' }}
        >
          📂 Browse Categories
        </button>

        <button
          onClick={() => handleNavAction('nl-search')}
          className="btn btn-secondary"
          style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', width: '100%' }}
        >
          🧠 Natural Language Search
        </button>

        {user && user.role !== 'admin' && (
          <button
            onClick={() => handleNavAction('cart')}
            className={`btn ${currentTab === 'cart' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', width: '100%', position: 'relative' }}
          >
            🛒 My Cart
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                right: '12px',
                background: 'var(--alert-danger)',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: '700',
                padding: '1px 6px',
                borderRadius: '999px'
              }}>
                {cartCount}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => handleNavAction('profile')}
          className={`btn ${currentTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', width: '100%' }}
        >
          👤 Profile Page
        </button>

        {user && user.role === 'admin' && (
          <button
            onClick={() => handleNavAction('admin')}
            className={`btn ${currentTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', width: '100%' }}
          >
            🛡️ Admin Panel
          </button>
        )}

        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', width: '100%', border: '1px dashed var(--alert-danger)', color: 'var(--alert-danger)', background: 'transparent' }}
        >
          🚪 Logout
        </button>
      </div>

      {/* Conditional Filter Panels (Visible only on 'catalog' tab) */}
      {currentTab === 'catalog' && (
        <>
          <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0', margin: '0' }} />
          
          <div id="filters-section-title">
            <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Catalog Filters</h4>
          </div>

          {/* Sorting Control */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Sort Listings</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select-field"
              style={{ fontSize: '0.8rem', padding: '8px' }}
            >
              <option value="relevance">✨ Relevance / Featured</option>
              <option value="price-asc">💵 Price: Low to High</option>
              <option value="price-desc">💵 Price: High to Low</option>
              <option value="rating">⭐ Top Customer Rated</option>
              <option value="popular">🔤 Alphabetic A-Z</option>
            </select>
          </div>

          {/* Category Section */}
          <div id="categories-filter-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Categories</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
              <button
                onClick={() => setSelectedCategory('all')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid ' + (selectedCategory === 'all' ? 'var(--accent-blue)' : 'transparent'),
                  background: selectedCategory === 'all' ? '#eff6ff' : 'transparent',
                  color: selectedCategory === 'all' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: selectedCategory === 'all' ? '700' : '500',
                  transition: 'background var(--transition-fast)'
                }}
              >
                <span>{selectedCategory === 'all' ? '🔹 ' : ''}🌐 All Categories</span>
              </button>
              {categories.map((cat) => {
                const count = products.filter(p => p.categoryId === cat.id).length;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid ' + (isSelected ? 'var(--accent-blue)' : 'transparent'),
                      background: isSelected ? '#eff6ff' : 'transparent',
                      color: isSelected ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: isSelected ? '700' : '500',
                      transition: 'background var(--transition-fast)'
                    }}
                  >
                    <span>{isSelected ? '🔹 ' : ''}{cat.icon} {cat.name}</span>
                    <span className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Price Cap</label>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-blue)' }}>
                ${priceRange}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="3000"
              step="50"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              style={{
                width: '100%',
                cursor: 'pointer',
                accentColor: 'var(--accent-blue)'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              <span>$50</span>
              <span>$3,000</span>
            </div>
          </div>

          {/* Brand Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Brands</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto', paddingRight: '4px' }}>
              {uniqueBrands.map((brand) => (
                <label
                  key={brand}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                    style={{
                      width: '14px',
                      height: '14px',
                      accentColor: 'var(--accent-blue)',
                      cursor: 'pointer'
                    }}
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Inventory Stock Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                style={{
                  width: '14px',
                  height: '14px',
                  accentColor: 'var(--accent-blue)',
                  cursor: 'pointer'
                }}
              />
              <span>📦 In-Stock Only</span>
            </label>
          </div>

          <button
            onClick={resetAllFilters}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '6px', fontSize: '0.75rem', fontWeight: '700' }}
          >
            🔄 Reset Filters
          </button>
        </>
      )}
    </aside>
  );
};
