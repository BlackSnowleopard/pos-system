import React, { useState, useEffect } from 'react';

/**
 * ProductScanner Component
 * 
 * This component acts as the "Left Panel" of our Sales terminal.
 * It's responsible for fetching the current product catalog from the backend,
 * letting the cashier search across it, and providing a clickable interface
 * to add items to the cart. By extracting this into its own component, 
 * we keep our main SalesPage clean and easy to read.
 *
 * @param {Function} onAddToCart - Callback function passed from the parent (SalesPage) 
 *                                 to trigger when a product is selected.
 */
const ProductScanner = ({ onAddToCart }) => {
  // Local state for holding the list of products and the user's search query
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const token = localStorage.getItem('posToken'); // Get authentication token

  // Function to load products from the backend. Can take an optional 'search' string.
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

  // 'useEffect' runs our code exactly once when this component first appears on screen,
  // loading the initial, unfiltered list of products.
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line
  }, []);

  // When the user hits 'Enter' or clicks Search on the search form
  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(searchQuery);
  };

  return (
    <div className="product-scanner">
      {/* Search Header */}
      <div className="scanner-header">
        <h3>Catalog & Scanner</h3>
        <form onSubmit={handleSearch} className="search-bar" style={{ width: '100%' }}>
          <input 
            type="text" 
            placeholder="Scan Barcode or Search Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            style={{ width: '100%' }}
          />
          <button type="submit" className="btn-secondary">Search</button>
        </form>
      </div>

      {/* Product Grid Area */}
      <div className="product-grid">
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          products.map(product => (
            <div 
              key={product.product_id} 
              // We style the card slightly differently if the item is entirely out of stock
              className={`product-card ${product.quantity <= 0 ? 'out-of-stock' : ''}`}
              // If we have stock, we fire the parent's add-to-cart function when clicked
              onClick={() => {
                if (product.quantity > 0) onAddToCart(product);
              }}
            >
              <div className="p-name">{product.product_name}</div>
              <div className="p-price">${Number(product.price).toFixed(2)}</div>
              <div className="p-stock">
                Stock: <span className={product.quantity <= 10 ? 'text-danger' : ''}>{product.quantity}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductScanner;
