import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../commons/AuthContext';
import { Link } from 'react-router-dom';
import ProductScanner from '../components/ProductScanner';
import ShoppingCart from '../components/ShoppingCart';
import PaymentModal from '../components/PaymentModal';
import ReceiptModal from '../components/ReceiptModal';
import '../assets/css/styles.css';

/**
 * SalesPage (Terminal) Component
 * 
 * This is the parent component that glues Module 4 together.
 * By importing our separate 'ProductScanner' and 'ShoppingCart' components,
 * we utilize structural composition to keep this file purely focused on defining 
 * the high-level Logic and State (the "Brain" of the checkout process).
 */
import { User, Search } from 'react-iconly';

/**
 * SalesPage (Terminal) Component
 */
const SalesPage = () => {
  const { user } = useContext(AuthContext);
  
  const [cart, setCart] = useState([]); 
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false); 
  
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const token = localStorage.getItem('posToken');

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/customers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) setCustomers(await response.json());
      } catch (err) { console.error(err); }
    };
    loadCustomers();
  }, [token]);

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingParams = prevCart.find(item => item.product_id === product.product_id);
      
      if (existingParams) {
        if (existingParams.quantity >= product.quantity) {
          alert('Cannot add more - exceeds available stock!');
          return prevCart;
        }
        return prevCart.map(item => 
          item.product_id === product.product_id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (productId, change) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        if (item.product_id === productId) {
          const newQty = item.quantity + change;
          if (newQty < 1) return item; 
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const handleRemoveItem = (productId) => {
    setCart((prev) => prev.filter(item => item.product_id !== productId));
  };

  const handleInitiateCheckout = () => {
    if (cart.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  const handleCheckout = async (paymentDetails) => {
    setIsProcessing(true);

    try {
      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cartItems: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
          discount: discount,
          paymentDetails: paymentDetails,
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
        } catch (receiptErr) {
          console.error("Failed to load receipt UI", receiptErr);
          alert("Sale completed, but failed to load receipt graphic.");
        }

      } else {
        alert(data.error || 'Checkout failed');
      }
    } catch (error) {
      console.error(error);
      alert('Internal Server Error during checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="terminal-view fade-in">
      <main className="terminal-grid">
        <ProductScanner onAddToCart={handleAddToCart} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Customer Selection Block */}
          <div className="pro-card glass" style={{ border: '1px solid var(--primary-glow)' }}>
            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <User set="bulk" primaryColor="var(--primary)" size={16} /> Assign Customer
            </h4>
            <div style={{ position: 'relative' }}>
              <Search set="light" size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <select 
                className="input-field"
                style={{ paddingLeft: '36px', background: 'rgba(0,0,0,0.2)' }}
                value={selectedCustomerId} 
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">-- Anonymous / Walk-in --</option>
                {customers.map(c => (
                  <option key={c.customer_id} value={c.customer_id}>{c.name} ({c.phone || c.email})</option>
                ))}
              </select>
            </div>
          </div>

          <ShoppingCart 
            cart={cart}
            updateQuantity={handleUpdateQuantity}
            removeItem={handleRemoveItem}
            discount={discount}
            setDiscount={setDiscount}
            onInitiateCheckout={handleInitiateCheckout}
            isProcessing={isProcessing}
          />
        </div>
      </main>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={handleCheckout}
        totalDue={Math.max(0, cart.reduce((t, i) => t + (i.price * i.quantity), 0) - discount)}
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
