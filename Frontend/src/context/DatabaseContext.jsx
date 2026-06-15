import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DatabaseContext = createContext();

const API_BASE_URL = 'http://localhost:8000/api/products';

// Fallback Seed Data in case backend is offline or loading
const initialCategories = [
  { id: 'cat-laptops', name: 'Laptops', icon: '💻' },
  { id: 'cat-smartphones', name: 'Smartphones', icon: '📱' },
  { id: 'cat-fashion', name: 'Fashion & Apparel', icon: '👕' },
  { id: 'cat-home', name: 'Home & Kitchen', icon: '🏡' },
  { id: 'cat-books', name: 'Books & Stationery', icon: '📚' },
  { id: 'cat-fitness', name: 'Sports & Fitness', icon: '🏋️' },
  { id: 'cat-groceries', name: 'Groceries', icon: '🍎' },
  { id: 'cat-accessories', name: 'Accessories', icon: '🎧' },
  { id: 'cat-storage', name: 'Storage Drives', icon: '💾' },
  { id: 'cat-cameras', name: 'Cameras & Imaging', icon: '📷' }
];

export const DatabaseProvider = ({ children }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState([]);

  // Persistent user placed orders
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('clickcart_orders') || localStorage.getItem('nexus_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Shopping carts state: { [username]: [ { productId, quantity } ] }
  const [userCarts, setUserCarts] = useState(() => {
    const saved = localStorage.getItem('clickcart_user_carts') || localStorage.getItem('nexus_user_carts');
    return saved ? JSON.parse(saved) : {};
  });

  const [searchCount, setSearchCount] = useState(() => {
    const saved = localStorage.getItem('db_search_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [adminStats, setAdminStats] = useState(() => {
    const saved = localStorage.getItem('db_admin_stats');
    return saved ? JSON.parse(saved) : { added: 0, updated: 0, deleted: 0 };
  });

  const [recentActivities, setRecentActivities] = useState(() => {
    const saved = localStorage.getItem('db_recent_activities');
    return saved ? JSON.parse(saved) : [];
  });

  // Derived properties for backwards compatibility in components accessing them directly
  const pricing = products.map(p => ({
    productId: p.id,
    price: p.originalPrice,
    discountPercentage: p.discountPercentage
  }));

  const inventory = products.map(p => ({
    productId: p.id,
    stockQuantity: p.stock,
    warehouseLocation: p.warehouse,
    restockDate: p.restockDate
  }));

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('clickcart_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('clickcart_user_carts', JSON.stringify(userCarts));
  }, [userCarts]);

  useEffect(() => {
    localStorage.setItem('db_search_count', searchCount.toString());
  }, [searchCount]);

  useEffect(() => {
    localStorage.setItem('db_admin_stats', JSON.stringify(adminStats));
  }, [adminStats]);

  useEffect(() => {
    localStorage.setItem('db_recent_activities', JSON.stringify(recentActivities));
  }, [recentActivities]);

  const addActivity = (type, text) => {
    const newAct = {
      id: 'act-' + Date.now() + '-' + Math.floor(Math.random() * 100),
      type,
      text,
      timestamp: new Date().toISOString()
    };
    setRecentActivities(prev => [newAct, ...prev].slice(0, 15));
  };

  // Main fetch function to reload catalog
  const refreshCatalog = async () => {
    try {
      // 1. Fetch categories
      const catRes = await fetch(`${API_BASE_URL}/categories`);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.length > 0 ? catData : initialCategories);
      }

      // 2. Fetch products
      const prodRes = await fetch(API_BASE_URL);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
    } catch (err) {
      console.error('Failed to load catalog from FastAPI backend:', err);
    }
  };

  // Initial load
  useEffect(() => {
    refreshCatalog();
  }, []);

  // Retrieve unified details of a single product
  const getProductDetails = (id) => {
    return products.find(p => p.id === id) || null;
  };

  const getCatalog = () => {
    return products;
  };

  // Synonym definitions for frontend search fallback
  const SEARCH_SYNONYMS = {
    'mobile': ['phone', 'smartphone', 'mobile', 'device', 'cellular', 'handset', 'foldable', 'nexus', 'pixelshot', 'litephone'],
    'phone': ['mobile', 'smartphone', 'device', 'cellular', 'handset', 'foldable', 'nexus', 'pixelshot', 'litephone'],
    'smartphone': ['mobile', 'phone', 'device', 'cellular', 'handset', 'foldable', 'nexus', 'pixelshot', 'litephone'],
    'laptop': ['notebook', 'ultrabook', 'computer', 'titan', 'creator', 'officepad', 'workstation'],
    'notebook': ['laptop', 'ultrabook', 'computer', 'titan', 'creator', 'officepad', 'workstation'],
    'ultrabook': ['laptop', 'notebook', 'computer', 'titan', 'creator', 'officepad', 'workstation'],
    'computer': ['laptop', 'notebook', 'ultrabook', 'titan', 'creator', 'officepad', 'workstation', 'desktop', 'pc'],
    'camera phone': ['photography', 'camera', 'photo', 'pixelshot', 'opticphone', 'cineshot', 'lens'],
    'camera': ['photography', 'cineshot', 'webcam', 'pixelshot', 'opticphone', 'streamvibe', 'photo', 'video', 'lens'],
    'photography': ['camera', 'photo', 'cineshot', 'pixelshot', 'video', 'lens'],
    'gaming': ['game', 'titan', 'rtx', 'gpu', 'mouse', 'keyboard', 'laserglide', 'clickclack', 'accessory', 'play'],
    'audio': ['soundwave', 'headphones', 'earbuds', 'music', 'sound', 'anc', 'speaker'],
    'headphones': ['soundwave', 'audio', 'earbuds', 'music', 'sound', 'anc', 'speaker'],
    'keyboard': ['clickclack', 'mech', 'switches', 'accessory', 'input'],
    'mouse': ['laserglide', 'gaming', 'wireless', 'accessory', 'input'],
    'storage': ['ssd', 'hdd', 'fastvault', 'terablock', 'drive', 'disk', 'backup', 'external'],
    'ssd': ['storage', 'fastvault', 'drive', 'disk', 'external', 'portable'],
    'hdd': ['storage', 'terablock', 'drive', 'disk', 'backup', 'desktop'],
    'fashion': ['clothing', 'jacket', 'shoes', 'backpack', 'sneakers', 'apparel', 'vintage', 'leather', 'wear', 'bag'],
    'clothing': ['fashion', 'jacket', 'shoes', 'backpack', 'sneakers', 'apparel', 'vintage', 'leather', 'wear', 'bag'],
    'apparel': ['fashion', 'clothing', 'jacket', 'shoes', 'backpack', 'sneakers', 'vintage', 'leather', 'wear', 'bag'],
    'kitchen': ['home', 'french press', 'chef knife', 'water bottle', 'cook', 'appliance', 'barista', 'knife'],
    'home': ['kitchen', 'french press', 'chef knife', 'water bottle', 'cook', 'appliance', 'barista', 'knife'],
    'books': ['stationery', 'journal', 'notebook', 'programming', 'pen', 'paper', 'read', 'algorithms', 'cs'],
    'stationery': ['books', 'journal', 'notebook', 'pen', 'paper', 'writing'],
    'fitness': ['sports', 'yoga', 'mat', 'exercise', 'sneakers', 'running', 'stretch', 'active'],
    'sports': ['fitness', 'yoga', 'mat', 'exercise', 'sneakers', 'running', 'stretch', 'active'],
    'groceries': ['food', 'apple', 'coffee', 'milk', 'organic', 'fresh', 'farm', 'beverage', 'drink'],
    'food': ['groceries', 'apple', 'coffee', 'milk', 'organic', 'fresh', 'farm', 'beverage', 'drink']
  };

  // Local search fallback function
  const localSemanticSearch = (queryText) => {
    const query = queryText.toLowerCase().trim();
    const catalog = getCatalog();

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
    const matched = catalog.filter(product => {
      const matchText = `${product.name} ${product.brand} ${product.categoryName} ${product.longDescription} ${(product.tags || []).join(' ')}`.toLowerCase();
      
      return tokens.every(token => {
        if (matchText.includes(token)) return true;
        const originalToken = tokens.find(t => t.startsWith(token)) || token;
        if (matchText.includes(originalToken)) return true;
        const synonyms = SEARCH_SYNONYMS[token];
        if (synonyms && synonyms.some(syn => matchText.includes(syn))) return true;
        if ((token === 'phone' || token === 'mobile') && product.categoryId === 'cat-smartphones') return true;
        if (token === 'laptop' && product.categoryId === 'cat-laptops') return true;
        if (token === 'camera' && product.categoryId === 'cat-cameras') return true;
        if ((token === 'grocer' || token === 'food') && product.categoryId === 'cat-groceries') return true;
        return false;
      });
    });

    return { results: matched, metadata: null };
  };

  // Main Semantic Search calling FastAPI backend vector embedding route
  const executeSemanticSearch = async (queryText, username = 'guest_user') => {
    const query = queryText.trim();
    if (!query) {
      return { results: getCatalog(), metadata: null };
    }

    setSearchCount(prev => prev + 1);

    try {
      const response = await fetch(`${API_BASE_URL}/search/semantic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query,
          username: username
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Semantic search failed.');
      }

      return {
        results: data.results,
        metadata: null
      };
    } catch (err) {
      console.warn('FastAPI semantic search failed, using client-side fallback:', err.message);
      return localSemanticSearch(queryText);
    }
  };

  // Category CRUD Operations
  const addCategory = async (name, icon) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Username': user?.username
        },
        body: JSON.stringify({ name, icon })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to add category.');
      }

      refreshCatalog();
      addActivity('add-category', `Added category "${name}"`);
      return data.id;
    } catch (err) {
      console.error('Error adding category:', err.message);
      // Local state fallback
      const newId = 'cat-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      setCategories(prev => [...prev, { id: newId, name, icon }]);
      return newId;
    }
  };

  const updateCategory = (id, name, icon) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name, icon } : c));
    addActivity('update-category', `Updated category "${name}"`);
  };

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    addActivity('delete-category', `Deleted category ID "${id}"`);
  };

  // Product CRUD Operations calling FastAPI backend
  const addProduct = async (pData, dData, eTags) => {
    const payload = {
      name: pData.name,
      brand: pData.brand,
      categoryId: pData.categoryId,
      price: Number(pData.price || 99),
      discountPercentage: Number(pData.discountPercentage || 0),
      stockQuantity: Number(pData.stockQuantity || 10),
      warehouseLocation: pData.warehouseLocation || 'WH-General-A1',
      imageColor: pData.imageColor || '#3b82f6',
      image: pData.image || '',
      rating: Number(pData.rating || 5.0),
      longDescription: dData.longDescription || 'No description provided.',
      keyFeatures: dData.keyFeatures || [],
      technicalSpecs: dData.technicalSpecs || {},
      tags: eTags || []
    };

    const url = API_BASE_URL;
    console.log('[API CALL] POST', url);
    console.log('[API REQUEST PAYLOAD]', payload);

    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Username': user?.username
      };
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      console.log('[API RESPONSE STATUS]', response.status);
      const data = await response.json();
      console.log('[API RESPONSE DATA]', data);

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create product.');
      }

      await refreshCatalog();
      setAdminStats(prev => ({ ...prev, added: prev.added + 1 }));
      addActivity('add-product', `Added product "${pData.name}"`);
      return { success: true, id: data.id };
    } catch (err) {
      console.error('[API ERROR] Error adding product:', err.message);
      return { success: false, error: err.message };
    }
  };

  const updateProduct = async (id, pData, dData, eTags) => {
    const payload = {
      name: pData.name,
      brand: pData.brand,
      categoryId: pData.categoryId,
      price: Number(pData.price),
      discountPercentage: Number(pData.discountPercentage),
      stockQuantity: Number(pData.stockQuantity),
      warehouseLocation: pData.warehouseLocation,
      imageColor: pData.imageColor,
      image: pData.image,
      rating: Number(pData.rating),
      longDescription: dData.longDescription,
      keyFeatures: dData.keyFeatures,
      technicalSpecs: dData.technicalSpecs,
      tags: eTags
    };

    const url = `${API_BASE_URL}/${id}`;
    console.log('[API CALL] PUT', url);
    console.log('[API REQUEST PAYLOAD]', payload);

    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Username': user?.username
      };
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(payload)
      });

      console.log('[API RESPONSE STATUS]', response.status);
      const data = await response.json();
      console.log('[API RESPONSE DATA]', data);

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update product.');
      }

      await refreshCatalog();
      setAdminStats(prev => ({ ...prev, updated: prev.updated + 1 }));
      addActivity('update-product', `Updated product "${pData.name}"`);
      return { success: true };
    } catch (err) {
      console.error('[API ERROR] Error updating product:', err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteProduct = async (id) => {
    const url = `${API_BASE_URL}/${id}`;
    console.log('[API CALL] DELETE', url);

    try {
      const headers = {
        'X-Username': user?.username
      };
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers
      });

      console.log('[API RESPONSE STATUS]', response.status);
      const data = await response.json();
      console.log('[API RESPONSE DATA]', data);

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete product.');
      }

      await refreshCatalog();
      setAdminStats(prev => ({ ...prev, deleted: prev.deleted + 1 }));
      addActivity('delete-product', `Deleted product ID "${id}"`);
      return { success: true };
    } catch (err) {
      console.error('[API ERROR] Error deleting product:', err.message);
      return { success: false, error: err.message };
    }
  };

  // Place Order transaction logic
  const placeOrder = (username, items, total) => {
    if (!username) return null;

    const newOrder = {
      id: 'ord-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      username,
      date: new Date().toISOString(),
      items: items.map(item => ({
        productId: item.id || item.productId,
        name: item.name,
        brand: item.brand,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '',
        imageColor: item.imageColor || '#3d82f6'
      })),
      total,
      status: 'Completed'
    };

    // Deduct inventory locally and update on backend if relevant (can reload catalogue to sync)
    items.forEach(async (purchasedItem) => {
      const details = getProductDetails(purchasedItem.id || purchasedItem.productId);
      if (details) {
        const newStock = Math.max(0, details.stock - purchasedItem.quantity);
        await updateProduct(details.id, {
          name: details.name,
          brand: details.brand,
          categoryId: details.categoryId,
          price: details.originalPrice,
          discountPercentage: details.discountPercentage,
          stockQuantity: newStock,
          warehouseLocation: details.warehouse,
          imageColor: details.imageColor,
          image: details.image,
          rating: details.rating
        }, {
          longDescription: details.longDescription,
          keyFeatures: details.keyFeatures,
          technicalSpecs: details.technicalSpecs
        }, details.tags);
      }
    });

    setOrders(prev => [newOrder, ...prev]);
    clearCart(username);
    return newOrder;
  };

  // Shopping Cart API
  const addToCart = (productId, username) => {
    if (!username) return;
    setUserCarts(prev => {
      const activeCart = prev[username] ? [...prev[username]] : [];
      const itemIndex = activeCart.findIndex(item => item.productId === productId);
      
      if (itemIndex > -1) {
        activeCart[itemIndex] = {
          ...activeCart[itemIndex],
          quantity: activeCart[itemIndex].quantity + 1
        };
      } else {
        activeCart.push({ productId, quantity: 1 });
      }

      return {
        ...prev,
        [username]: activeCart
      };
    });
  };

  const removeFromCart = (productId, username) => {
    if (!username) return;
    setUserCarts(prev => {
      const activeCart = prev[username] ? [...prev[username]] : [];
      const updatedCart = activeCart.filter(item => item.productId !== productId);
      return {
        ...prev,
        [username]: updatedCart
      };
    });
  };

  const updateCartQuantity = (productId, quantity, username) => {
    if (!username) return;
    if (quantity <= 0) {
      removeFromCart(productId, username);
      return;
    }
    setUserCarts(prev => {
      const activeCart = prev[username] ? [...prev[username]] : [];
      const itemIndex = activeCart.findIndex(item => item.productId === productId);
      if (itemIndex > -1) {
        activeCart[itemIndex] = {
          ...activeCart[itemIndex],
          quantity: parseInt(quantity)
        };
      }
      return {
        ...prev,
        [username]: activeCart
      };
    });
  };

  const clearCart = (username) => {
    if (!username) return;
    setUserCarts(prev => ({
      ...prev,
      [username]: []
    }));
  };

  const getCartDetails = (username) => {
    if (!username) return { items: [], total: 0 };
    const cartItems = userCarts[username] || [];
    
    let total = 0;
    const items = cartItems.map(item => {
      const details = getProductDetails(item.productId);
      if (!details) return null;
      const subtotal = Number((details.price * item.quantity).toFixed(2));
      total += subtotal;
      return {
        ...details,
        quantity: item.quantity,
        subtotal
      };
    }).filter(Boolean);

    return {
      items,
      total: Number(total.toFixed(2))
    };
  };

  const getCartCount = (username) => {
    if (!username) return 0;
    const cartItems = userCarts[username] || [];
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  return (
    <DatabaseContext.Provider value={{
      categories,
      products,
      pricing,
      inventory,
      orders,
      getCatalog,
      getProductDetails,
      executeSemanticSearch,
      addProduct,
      updateProduct,
      deleteProduct,
      searchCount,
      addCategory,
      updateCategory,
      deleteCategory,
      
      // Cart Exports
      userCarts,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      getCartDetails,
      getCartCount,

      // Admin statistics and audit logs
      adminStats,
      recentActivities,
      addActivity,
      refreshCatalog
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
