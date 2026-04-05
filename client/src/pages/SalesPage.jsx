import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../commons/AuthContext';
import PaymentModal from '../components/PaymentModal';
import ReceiptModal from '../components/ReceiptModal';
import { Search, Buy, Delete, Plus, Wallet, Ticket, ChevronLeft } from 'react-iconly';

// Custom Minus Icon
const MinusIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 12H18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Category icons mapping
const categoryIcons = {
  'Electronics': '📱',
  'Snacks': '🍿',
  'Food': '🍛',
  'Kitchen': '🍳',
  'Furniture': '🪑',
  'Stationery': '📎',
  'Toiletries': '🧴',
  'Fun & Toys': '🎮',
  'Beverages': '☕',
  'General': '📦',
};

const SalesPage = () => {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('posToken');
  
  const [cart, setCart] = useState([]); 
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false); 
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Product browsing state
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const headers = { 'Authorization': `Bearer ${token}` };
      try {
        const [prodRes, custRes] = await Promise.all([
          fetch('http://localhost:5000/api/products', { headers }),
          fetch('http://localhost:5000/api/customers', { headers }),
        ]);
        if (prodRes.ok) {
          const products = await prodRes.json();
          setAllProducts(products);
          // Extract unique categories
          const cats = [...new Set(products.map(p => p.category || 'General'))];
          setCategories(cats);
        }
        if (custRes.ok) setCustomers(await custRes.json());
      } catch (err) { console.error(err); }
    };
    loadData();
  }, [token]);

  // Filter products
  const getFilteredProducts = () => {
    let filtered = allProducts;
    if (selectedCategory) {
      filtered = filtered.filter(p => (p.category || 'General') === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.product_name.toLowerCase().includes(q) || 
        (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }
    return filtered;
  };

  const subtotal = cart.reduce((t, i) => t + (i.price * i.quantity), 0);
  const total = Math.max(0, subtotal - discount);

  const handleAddToCart = (product) => {
    if (product.quantity <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.product_id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          alert('Cannot add more — exceeds available stock.');
          return prev;
        }
        return prev.map(item => 
          item.product_id === product.product_id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId, change) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === productId) {
        const newQty = item.quantity + change;
        if (newQty < 1) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveItem = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const handleCheckout = async (paymentDetails) => {
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          cartItems: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
          discount,
          paymentDetails,
          customer_id: selectedCustomerId || null
        })
      });
      const data = await response.json();
      if (response.ok) {
        setCart([]);
        setDiscount(0);
        setSelectedCustomerId('');
        setIsPaymentModalOpen(false);
        try {
          const receiptRes = await fetch(`http://localhost:5000/api/sales/${data.sale_id}/receipt`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (receiptRes.ok) {
            setReceiptData(await receiptRes.json());
            setIsReceiptModalOpen(true);
          }
        } catch (e) { console.error('Receipt error', e); }
        // Reload products to update stock
        const prodRes = await fetch('http://localhost:5000/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (prodRes.ok) setAllProducts(await prodRes.json());
      } else {
        alert(data.error || 'Checkout failed');
      }
    } catch (error) {
      console.error(error);
      alert('Server error during checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="sales-layout">
      {/* ===== LEFT PANEL: Cart ===== */}
      <div className="sales-cart-panel">
        {/* Large Total Display */}
        <div className="total-display">
          <div className="total-label">Total</div>
          <div className="total-amount">₵{total.toFixed(2)}</div>
        </div>

        {/* Current Sale Section */}
        <div className="cart-section" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="cart-section-header">
            <h4>Current Sale</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Discount (₵):</span>
              <input 
                type="number" 
                className="input-field"
                style={{ width: '70px', padding: '5px 8px', fontSize: '0.8rem', textAlign: 'center' }}
                value={discount} 
                onChange={(e) => setDiscount(Number(e.target.value))}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <Buy set="bulk" size={36} style={{ opacity: 0.15 }} />
              <p>Cart is empty.</p>
              <p style={{ fontSize: '0.75rem' }}>Scan an item to begin</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product_id} className="cart-item">
                <span className="item-name">{item.product_name}</span>
                <div className="item-qty-controls">
                  <button onClick={() => handleUpdateQuantity(item.product_id, -1)}>
                    <MinusIcon size={12} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(item.product_id, 1)}>
                    <Plus set="light" size={12} />
                  </button>
                </div>
                <span className="item-total">₵{(item.price * item.quantity).toFixed(2)}</span>
                <button className="item-remove" onClick={() => handleRemoveItem(item.product_id)}>
                  <Delete set="bulk" size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer: Totals + Payment */}
        <div className="cart-footer-section">
          <div className="cart-subtotals">
            <div className="subtotal-row">
              <span>Subtotal</span>
              <span>₵{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="subtotal-row" style={{ color: 'var(--accent)' }}>
                <span>Discount</span>
                <span>-₵{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="total-row">
              <span>Total</span>
              <span>₵{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.75rem', marginBottom: '4px' }}>Payment method</div>
          <div className="payment-methods">
            {['CASH', 'MOBILE_MONEY', 'CARD'].map(m => (
              <button 
                key={m} 
                className={`payment-method-btn ${paymentMethod === m ? 'active' : ''}`}
                onClick={() => setPaymentMethod(m)}
              >
                {m === 'CASH' ? 'Cash' : m === 'MOBILE_MONEY' ? 'MoMo' : 'Card'}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="cart-action-buttons">
            <button 
              className="btn-secondary" 
              style={{ flex: 1 }}
              onClick={() => { setCart([]); setDiscount(0); }}
            >
              Cancel
            </button>
            <button 
              className="btn-primary" 
              style={{ flex: 2 }}
              disabled={cart.length === 0 || isProcessing}
              onClick={() => setIsPaymentModalOpen(true)}
            >
              {isProcessing ? 'Processing...' : (
                <>
                  <Wallet set="bulk" size={16} /> Checkout
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL: Products ===== */}
      <div className="sales-products-panel">
        {/* Search Bar */}
        <div className="sales-search-bar">
          <span className="search-icon">
            <Search set="light" size={18} primaryColor="currentColor" />
          </span>
          <input 
            type="text"
            placeholder="Scan Barcode or Search Product Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category View or Product View */}
        {!selectedCategory && !searchQuery.trim() ? (
          <>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Categories</h3>
            <div className="category-grid" style={{ overflowY: 'auto', flex: 1 }}>
              {categories.map(cat => {
                const count = allProducts.filter(p => (p.category || 'General') === cat).length;
                return (
                  <div 
                    key={cat} 
                    className="category-card"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <div className="cat-icon">{categoryIcons[cat] || '📦'}</div>
                    <div className="cat-name">{cat}</div>
                    <div className="cat-count">{count} items</div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {selectedCategory && (
                <button className="back-to-categories" onClick={() => setSelectedCategory(null)}>
                  <ChevronLeft set="light" size={14} primaryColor="currentColor" />
                  Categories
                </button>
              )}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {selectedCategory || 'Search Results'} · {filteredProducts.length} items
              </span>
            </div>
            <div className="sales-product-grid">
              {filteredProducts.length === 0 ? (
                <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                  No products found.
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div 
                    key={product.product_id}
                    className={`sales-product-card ${product.quantity <= 0 ? 'out-of-stock' : ''}`}
                    onClick={() => handleAddToCart(product)}
                  >
                    <div className="prod-name">{product.product_name}</div>
                    <div className="prod-price">₵{Number(product.price).toFixed(2)}</div>
                    <div className="prod-stock">
                      {product.quantity <= 0 ? 'Out of stock' : `${product.quantity} in stock`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={handleCheckout}
        totalDue={total}
      />
      <ReceiptModal 
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receiptData={receiptData}
      />
    </div>
  );
};

export default SalesPage;
