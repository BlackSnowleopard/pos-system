import React, { useState, useContext, useEffect, useRef } from 'react';
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
  const [isScanning, setIsScanning] = useState(false);

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

  const subtotal = cart.reduce((t, i) => t + (parseFloat(i.price) * i.quantity), 0);
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * discount) / 100 
    : discount;
  const total = Math.max(0, subtotal - discountAmount);
  
  // Debug cart calculation
  console.log('Cart calculation debug:', {
    cartItems: cart,
    subtotal: subtotal,
    discountAmount: discountAmount,
    total: total,
    cartLength: cart.length
  });

  const handleAddToCart = React.useCallback((product) => {
    console.log('Adding to cart:', product);
    if (product.quantity <= 0) {
      console.log('Product out of stock:', product.product_name);
      return;
    }
    setCart(prev => {
      console.log('Current cart:', prev);
      const existing = prev.find(item => item.product_id === product.product_id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          alert('Cannot add more — exceeds available stock.');
          return prev;
        }
        const newCart = prev.map(item => 
          item.product_id === product.product_id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        console.log('Updated cart (existing item):', newCart);
        return newCart;
      }
      const newCart = [...prev, { ...product, quantity: 1 }];
      console.log('Updated cart (new item):', newCart);
      return newCart;
    });
  }, []);

  // --- BULLETPROOF BARCODE SCANNER ---
  const barcodeBufferRef = useRef('');
  const lastKeyTimeRef = useRef(Date.now());
  const scanningTimeoutRef = useRef(null);
  const autoProcessTimeoutRef = useRef(null);
  
  // Keep refs of dependencies so the listener never has to re-attach
  const allProductsRef = useRef(allProducts);
  const handleAddToCartRef = useRef(handleAddToCart);
  const isScanningRef = useRef(isScanning);
  const tokenRef = useRef(token);

  useEffect(() => {
    allProductsRef.current = allProducts;
    handleAddToCartRef.current = handleAddToCart;
    isScanningRef.current = isScanning;
    tokenRef.current = token;
  }, [allProducts, handleAddToCart, isScanning, token]);

  const processScannedCode = async (scannedCode) => {
    const code = scannedCode.trim();
    if (code.length < 3) return;

    console.log(`[Scanner] Finalizing: "${code}"`);
    
    // 1. Local Search
    let match = allProductsRef.current.find(p => 
      (p.barcode && p.barcode.trim() === code) || 
      (p.product_id && p.product_id.toString() === code)
    );
    
    // 2. Database Fallback
    if (!match) {
      console.log(`[Scanner] Local match failed for "${code}". Searching database...`);
      try {
        const headers = { 'Authorization': `Bearer ${tokenRef.current}` };
        const response = await fetch(`http://localhost:5000/api/products?search=${encodeURIComponent(code)}`, { headers });
        if (response.ok) {
          const results = await response.json();
          match = results.find(p => p.barcode === code || p.product_id?.toString() === code);
          if (match) {
            console.log(`[Scanner] Database match found: ${match.product_name}`);
            setAllProducts(prev => [match, ...prev]);
          }
        }
      } catch (err) { console.error('[Scanner] DB Error:', err); }
    }

    if (match) {
      console.log(`✓ Added to Cart: ${match.product_name}`);
      handleAddToCartRef.current(match);
      setSearchQuery('');
    } else {
      console.warn(`⚠️ Product not found: "${code}"`);
      alert(`Product not found: "${code}"\n\nPlease ensure it's registered in Inventory.`);
    }
    
    barcodeBufferRef.current = '';
    setIsScanning(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore irrelevant inputs
      if (e.target.tagName === 'TEXTAREA') return;
      if (e.target.tagName === 'INPUT' && 
          e.target.type === 'text' && 
          e.target.value.length > 0 &&
          e.target.placeholder !== 'Scan Barcode or Search Product Name...' &&
          e.target.placeholder !== '🔴 Scanning...') return;

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      
      // Clear any existing auto-process or UI timeouts
      if (autoProcessTimeoutRef.current) clearTimeout(autoProcessTimeoutRef.current);
      if (scanningTimeoutRef.current) clearTimeout(scanningTimeoutRef.current);

      // detect scanner (fast sequence)
      if (!isScanningRef.current && timeDiff < 60) {
        setIsScanning(true);
      }
      
      // Auto-hide scanning UI indicator
      scanningTimeoutRef.current = setTimeout(() => setIsScanning(false), 2000);

      // Human reset (long gap when NOT scanning)
      if (timeDiff > 250 && !isScanningRef.current) {
        barcodeBufferRef.current = '';
      }
      
      lastKeyTimeRef.current = currentTime;

      if (e.key === 'Enter') {
        processScannedCode(barcodeBufferRef.current);
        return;
      }

      if (e.key.length === 1) {
        barcodeBufferRef.current += e.key;
        
        // Auto-process fallback (in case phone doesn't send Enter)
        // Wait 350ms of silence before assuming the scan is done
        autoProcessTimeoutRef.current = setTimeout(() => {
          if (barcodeBufferRef.current.length >= 3) {
            console.log('[Scanner] Auto-processing due to silence/timeout');
            processScannedCode(barcodeBufferRef.current);
          }
        }, 350);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (scanningTimeoutRef.current) clearTimeout(scanningTimeoutRef.current);
      if (autoProcessTimeoutRef.current) clearTimeout(autoProcessTimeoutRef.current);
    };
  }, []); // LISTENER NEVER RE-ATTACHES

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
        onClear={() => {
          setCart([]);
          setDiscount(0);
        }}
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
            placeholder={isScanning ? "🔴 Scanning..." : "Scan Barcode or Search Product Name..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              borderColor: isScanning ? '#ef4444' : 'var(--border)',
              boxShadow: isScanning ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : 'none'
            }}
          />
          {isScanning && (
            <div style={{ 
              position: 'absolute', 
              right: '10px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#ef4444',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              SCANNING
            </div>
          )}
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
