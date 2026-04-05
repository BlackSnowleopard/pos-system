import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../commons/AuthContext';
import ShoppingCart from '../components/ShoppingCart';
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
  const [discountType, setDiscountType] = useState('percentage');
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
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * discount) / 100 
    : discount;
  const total = Math.max(0, subtotal - discountAmount);

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
      // If it's a MoMo or Card payment, verify with backend first
      if (paymentDetails.method === 'MOBILE_MONEY' || paymentDetails.method === 'CARD') {
        const verifyResponse = await fetch('http://localhost:5000/api/payments/verify', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ reference: paymentDetails.referenceId })
        });
        
        const verifyData = await verifyResponse.json();
        
        if (!verifyData.success) {
          alert(`Payment verification failed: ${verifyData.error}`);
          setIsProcessing(false);
          return;
        }
        
        // Update payment details with verified data
        paymentDetails.verifiedAmount = verifyData.data.amount / 100; // Convert back from kobo
        paymentDetails.customerPhone = verifyData.data.customer?.phone;
      }
      
      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          cartItems: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
          discount: discountAmount,
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
      <ShoppingCart 
        cart={cart}
        updateQuantity={handleUpdateQuantity}
        removeItem={handleRemoveItem}
        discount={discount}
        setDiscount={setDiscount}
        discountType={discountType}
        setDiscountType={setDiscountType}
        onInitiateCheckout={() => setIsPaymentModalOpen(true)}
        isProcessing={isProcessing}
      />

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
