import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useDatabase } from './context/DatabaseContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ShoppingCartView } from './components/ShoppingCartView';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthPage } from './components/AuthPage';
import { ProfileView } from './components/ProfileView';

function App() {
  const { user } = useAuth();
  const { getCatalog, orders } = useDatabase();

  // Active navigation tab: 'catalog', 'cart', 'admin', 'profile'
  const [currentTab, setCurrentTab] = useState('catalog');

  // Structured query filters state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState(3000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Active specs Modal target product ID
  const [activeDetailId, setActiveDetailId] = useState(null);

  // Enforce tab security: if role switches away from admin, kick back to catalog
  useEffect(() => {
    if (user) {
      if (user.role !== 'admin' && currentTab === 'admin') {
        setCurrentTab('catalog');
      }
    }
  }, [user, currentTab]);

  // Reset search and filters
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setPriceRange(3000);
    setInStockOnly(false);
    setSelectedBrands([]);
    setSortBy('relevance');
    setSearchQuery('');
  };

  // Compute final product grid list: blends search query with structured filters
  const getFilteredCatalog = () => {
    let baseList = getCatalog();

    // Instant/real-time keyword search matching with synonym expansion
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      
      // Singularize helper to handle English plurals (e.g. phones -> phone, mobiles -> mobile)
      const singularize = (w) => {
        let word = w.toLowerCase().trim();
        if (word.endsWith('s') && word.length > 3) {
          if (word.endsWith('es')) {
            word = word.slice(0, -2);
          } else {
            word = word.slice(0, -1);
          }
        }
        return word;
      };

      const tokens = query.split(/\s+/).map(singularize);
      
      const SEARCH_SYNONYMS = {
        'mobile': ['phone', 'smartphone', 'mobile', 'device', 'cellular', 'handset', 'foldable', 'nexus', 'pixelshot', 'litephone'],
        'phone': ['mobile', 'smartphone', 'device', 'cellular', 'handset', 'foldable', 'nexus', 'pixelshot', 'litephone'],
        'smartphone': ['mobile', 'phone', 'device', 'cellular', 'handset', 'foldable', 'nexus', 'pixelshot', 'litephone'],
        'laptop': ['notebook', 'ultrabook', 'computer', 'titan', 'creator', 'officepad', 'workstation'],
        'notebook': ['laptop', 'ultrabook', 'computer', 'titan', 'creator', 'officepad', 'workstation'],
        'ultrabook': ['laptop', 'notebook', 'computer', 'titan', 'creator', 'officepad', 'workstation'],
        'computer': ['laptop', 'notebook', 'ultrabook', 'titan', 'creator', 'officepad', 'workstation', 'desktop', 'pc'],
        'camera': ['photography', 'camera', 'photo', 'pixelshot', 'opticphone', 'cineshot', 'lens', 'webcam', 'streamvibe', 'video'],
        'photography': ['camera', 'photo', 'cineshot', 'pixelshot', 'video', 'lens'],
        'gaming': ['game', 'titan', 'rtx', 'gpu', 'mouse', 'keyboard', 'laserglide', 'clickclack', 'accessory', 'play']
      };

      baseList = baseList.filter(product => {
        const matchText = `${product.name} ${product.brand} ${product.categoryName} ${product.longDescription} ${(product.tags || []).join(' ')}`.toLowerCase();
        
        return tokens.every(token => {
          // 1. Direct match on normalized singular token
          if (matchText.includes(token)) return true;

          // 2. Direct match on original token in case singularizing trimmed too much
          const originalToken = tokens.find(t => t.startsWith(token)) || token;
          if (matchText.includes(originalToken)) return true;

          // 3. Synonym matches
          const synonyms = SEARCH_SYNONYMS[token];
          if (synonyms && synonyms.some(syn => matchText.includes(syn))) {
            return true;
          }

          // 4. Category-level automatic mappings
          if (token === 'phone' || token === 'mobile') {
            if (product.categoryId === 'cat-smartphones') return true;
          }
          if (token === 'laptop') {
            if (product.categoryId === 'cat-laptops') return true;
          }
          if (token === 'camera') {
            if (product.categoryId === 'cat-cameras') return true;
          }
          if (token === 'grocer' || token === 'food' || token === 'eat' || token === 'fruit') {
            if (product.categoryId === 'cat-groceries') return true;
          }
          if (token === 'cloth' || token === 'fashion' || token === 'dress' || token === 'shoe' || token === 'wear') {
            if (product.categoryId === 'cat-fashion') return true;
          }
          
          return false;
        });
      });
    }

    if (selectedCategory !== 'all') {
      baseList = baseList.filter(p => p.categoryId === selectedCategory);
    }

    baseList = baseList.filter(p => p.price <= priceRange);

    if (selectedBrands.length > 0) {
      baseList = baseList.filter(p => selectedBrands.includes(p.brand));
    }

    if (inStockOnly) {
      baseList = baseList.filter(p => p.stock > 0);
    }

    const sortedList = [...baseList];
    if (sortBy === 'price-asc') {
      sortedList.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      sortedList.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      sortedList.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'popular') {
      sortedList.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sortedList;
  };

  // Related products fallback logic
  const getRelatedProducts = () => {
    const catalog = getCatalog();
    if (selectedCategory !== 'all') {
      return catalog.filter(p => p.categoryId === selectedCategory).slice(0, 4);
    }
    if (selectedBrands.length > 0) {
      const brandMatches = catalog.filter(p => selectedBrands.includes(p.brand));
      if (brandMatches.length > 0) return brandMatches.slice(0, 4);
    }
    return [...catalog].sort((a, b) => b.rating - a.rating).slice(0, 4);
  };

  // STRICT ACCESS GUARD: If user is not authenticated, strictly show the Login/Signup screen!
  if (!user) {
    return (
      <div className="app-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
        <AuthPage />
      </div>
    );
  }

  const finalGridList = getFilteredCatalog();

  return (
    <div className="app-container">
      
      {/* Top Header navbar panel */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Primary Workspace split grid with persistent Sidebar */}
      <main className="main-layout animate-fade-in">
        
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          sortBy={sortBy}
          setSortBy={setSortBy}
          resetAllFilters={handleResetFilters}
        />

        <section className="content-area">
          
          {/* CATALOG TAB */}
          {currentTab === 'catalog' && (
            <>
              {/* Instant Search Bar */}
              <div className="card-panel">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      🔍 Search Product Catalog
                    </label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Search instantly by brand, name, category, or description
                    </span>
                  </div>

                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      id="catalog-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field"
                      placeholder="Search products, clothing, home goods, books..."
                      style={{ paddingLeft: '34px', paddingRight: searchQuery ? '36px' : '14px', fontSize: '0.92rem' }}
                    />
                    <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      🔍
                    </span>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '8px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Search suggestions tags */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                      POPULAR SEARCHES:
                    </span>
                    {['Laptop', 'Phone', 'Fashion', 'Kitchen', 'Books', 'Fitness'].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setSearchQuery(sug)}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          color: 'var(--text-secondary)',
                          borderRadius: '12px',
                          padding: '2px 8px',
                          fontSize: '0.68rem',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Filters Ribbon */}
              {(selectedCategory !== 'all' || selectedBrands.length > 0 || priceRange < 3000 || inStockOnly || searchQuery) && (
                <div className="card-panel animate-fade-in" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                      Active Filters:
                    </span>
                    <button 
                      onClick={handleResetFilters}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-blue)',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Clear All Filters
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {searchQuery && (
                      <span className="badge badge-blue" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => setSearchQuery('')}>
                        🔍 Search: "{searchQuery}" ✕
                      </span>
                    )}
                    {selectedCategory !== 'all' && (
                      <span className="badge badge-blue" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => setSelectedCategory('all')}>
                        📁 Category: {getCatalog().find(p => p.categoryId === selectedCategory)?.categoryName || selectedCategory} ✕
                      </span>
                    )}
                    {selectedBrands.map(brand => (
                      <span key={brand} className="badge badge-blue" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => setSelectedBrands(selectedBrands.filter(b => b !== brand))}>
                        🏷️ Brand: {brand} ✕
                      </span>
                    ))}
                    {priceRange < 3000 && (
                      <span className="badge badge-blue" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => setPriceRange(3000)}>
                        💵 Max ${priceRange} ✕
                      </span>
                    )}
                    {inStockOnly && (
                      <span className="badge badge-blue" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => setInStockOnly(false)}>
                        📦 In-Stock Only ✕
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Grid listings */}
              {finalGridList.length === 0 ? (
                <div className="card-panel" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📦</div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>No items match your active filters</h3>
                  <p style={{ fontSize: '0.8rem', maxWidth: '320px', margin: '0 auto 16px auto' }}>
                    Try relaxing your price constraints or category selections to view products.
                  </p>
                  
                  {/* Related products fallback */}
                  {getRelatedProducts().length > 0 && (
                    <div style={{ marginTop: '30px', textAlign: 'left' }}>
                      <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }} />
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
                        💡 Related products you might like:
                      </h4>
                      <div className="product-grid">
                        {getRelatedProducts().map((prod) => (
                          <ProductCard
                            key={prod.id}
                            product={prod}
                            onViewDetails={(id) => setActiveDetailId(id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {getRelatedProducts().length === 0 && (
                    <button onClick={handleResetFilters} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="product-grid">
                  {finalGridList.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onViewDetails={(id) => setActiveDetailId(id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* SHOPPING CART VIEW */}
          {currentTab === 'cart' && (
            <ShoppingCartView
              setCurrentTab={setCurrentTab}
              onViewDetails={(id) => setActiveDetailId(id)}
            />
          )}

          {/* ADMIN WORKSPACE TAB */}
          {currentTab === 'admin' && user.role === 'admin' && (
            <AdminDashboard onViewDetails={(id) => setActiveDetailId(id)} />
          )}

          {/* USER ACCOUNT PROFILE TAB */}
          {currentTab === 'profile' && (
            <ProfileView setCurrentTab={setCurrentTab} />
          )}

        </section>
      </main>

      {/* Product Detail overlay modal */}
      {activeDetailId && (
        <ProductDetailModal
          productId={activeDetailId}
          onClose={() => setActiveDetailId(null)}
          onSelectProduct={(id) => setActiveDetailId(id)}
        />
      )}

      {/* Footer banner */}
      <footer style={{
        textAlign: 'center',
        padding: '20px 0',
        borderTop: '1px solid #cbd5e1',
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
        background: '#ffffff'
      }}>
        ClickCart Product Discoverability Portal | Professional E-Commerce Experience.
      </footer>

    </div>
  );
}

export default App;
