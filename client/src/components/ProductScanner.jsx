import React, { useState, useEffect } from 'react';
import { Search, Filter, Category } from 'react-iconly';

const ProductScanner = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const token = localStorage.getItem('posToken');

  const loadProducts = async (search = '') => {
    try {
      const url = search 
        ? `http://localhost:5000/api/products?search=${encodeURIComponent(search)}`
        : 'http://localhost:5000/api/products';
        
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setProducts(await response.json());
      }
    } catch (error) {
      console.error('Failed to load products for scanner', error);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(searchQuery);
  };

  return (
    <div className="scanner-panel fade-in">
      {/* Modern Search Header */}
      <div className="scanner-header glass" style={{ borderBottom: '1px solid var(--border)', padding: '1.25rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
           <Category set="bulk" primaryColor="var(--primary)" size={18} /> Product Catalog
        </h3>
        <form onSubmit={handleSearch} className="search-bar" style={{ gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search set="light" size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              className="input-field"
              style={{ paddingLeft: '40px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}
              placeholder="Scan Barcode or Search Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="btn-secondary" style={{ padding: '10px' }} title="Reset View" onClick={() => {setSearchQuery(''); loadProducts('');}}>
             <Filter set="bulk" primaryColor="currentColor" size={18} />
          </button>
        </form>
      </div>

      {/* Modern Product Grid Area */}
      <div className="product-grid" style={{ padding: '1.25rem' }}>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', gridColumn: 'span 4' }}>
              No products found in catalog.
          </div>
        ) : (
          products.map(product => (
            <div 
              key={product.product_id} 
              className={`product-card pro-card ${product.quantity <= 0 ? 'out-of-stock' : 'hover-glow'}`}
              style={{ 
                textAlign: 'left', 
                padding: '1.25rem', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                background: product.quantity <= 0 ? 'rgba(0,0,0,0.2)' : 'var(--bg-card)'
              }}
              onClick={() => {
                if (product.quantity > 0) onAddToCart(product);
              }}
            >
              <div>
                <div className="p-name" style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{product.product_name}</div>
                <div className="badge" style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)' }}>
                  {product.category || 'General'}
                </div>
              </div>
              
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="p-price" style={{ color: 'var(--success)', fontSize: '1.1rem', fontWeight: 800 }}>
                  ${Number(product.price).toFixed(2)}
                </div>
                <div className={`badge ${product.quantity <= 10 ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                  {product.quantity} left
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductScanner;
