import React, { useState, useContext } from 'react';
import { AuthContext } from '../commons/AuthContext';
import { Link } from 'react-router-dom';
import ProductScanner from '../components/ProductScanner';
import ShoppingCart from '../components/ShoppingCart';
import PaymentModal from '../components/PaymentModal';
import '../assets/css/styles.css';

/**
 * SalesPage (Terminal) Component
 * 
 * This is the parent component that glues Module 4 together.
 * By importing our separate 'ProductScanner' and 'ShoppingCart' components,
 * we utilize structural composition to keep this file purely focused on defining 
 * the high-level Logic and State (the "Brain" of the checkout process).
 */
const SalesPage = () => {
  const { user, logout } = useContext(AuthContext);
  
  // -- The High Level State Variables --
  const [cart, setCart] = useState([]); // Array to hold products waiting to be bought
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false); // Used to disable buttons while waiting for DB
  
  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const token = localStorage.getItem('posToken');

  // Logic: Adding a scanned product to the cart
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      // Check if item is already in the array
      const existingParams = prevCart.find(item => item.product_id === product.product_id);
      
      if (existingParams) {
        // If it exists, but we've hit our physical stock limit, don't allow it.
        if (existingParams.quantity >= product.quantity) {
          alert('Cannot add more - exceeds available stock!');
          return prevCart;
        }
        // Otherwise, simply increase the quantity of the existing item
        return prevCart.map(item => 
          item.product_id === product.product_id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // First time adding the item, push it to our cart array with qty: 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Logic: Manually using +/- buttons in the cart to change quantity
  const handleUpdateQuantity = (productId, change) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        if (item.product_id === productId) {
          const newQty = item.quantity + change;
          // Don't allow dropping below 1. (If they want to remove string, they must hit trash icon)
          if (newQty < 1) return item; 
          // We ideally should check against max stock here, but the server handles hard enforcement.
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  // Logic: Clicking the trash can icon
  const handleRemoveItem = (productId) => {
    setCart((prev) => prev.filter(item => item.product_id !== productId));
  };

  // Logic: Triggers when Cashier hits the big 'Charge' button on the right panel
  const handleInitiateCheckout = () => {
    if (cart.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  // Logic: Submitting the cart and finalized payments to the Database API
  const handleCheckout = async (paymentDetails) => {
    // Safety lock the UI
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
          paymentDetails: paymentDetails
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Success! Clean everything up for the next customer
        alert(`Sale Checked Out Successfully! Sale ID: ${data.sale_id}`);
        setCart([]);
        setDiscount(0);
        setIsPaymentModalOpen(false);
      } else {
        alert(data.error || 'Checkout failed');
      }
    } catch (error) {
      console.error(error);
      alert('Internal Server Error during checkout');
    } finally {
      setIsProcessing(false); // Unlock the UI
    }
  };

  return (
    <div className="dashboard-container">
      {/* Top Universal Navbar */}
      <header className="dashboard-header">
        <div className="header-nav">
            <h1>Sales Terminal</h1>
            <nav className="top-nav">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/sales" className="active">Sales (Checkout)</Link>
                <Link to="/products">Products</Link>
                {/* Cashiers shouldn't see 'Inventory' based on our role model */}
                {(user?.role === 'Administrator' || user?.role === 'Manager') && (
                  <Link to="/inventory">Inventory</Link>
                )}
            </nav>
        </div>
        <div className="user-info">
          <span>{user?.name} ({user?.role})</span>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </header>

      {/* Main Terminal Area */}
      <main className="sales-terminal">
        {/* Left Panel: Component imported from ProductScanner.jsx */}
        <ProductScanner onAddToCart={handleAddToCart} />
        
        {/* Right Panel: Component imported from ShoppingCart.jsx */}
        <ShoppingCart 
          cart={cart}
          updateQuantity={handleUpdateQuantity}
          removeItem={handleRemoveItem}
          discount={discount}
          setDiscount={setDiscount}
          onInitiateCheckout={handleInitiateCheckout}
          isProcessing={isProcessing}
        />
      </main>

      {/* Pop-up Payment Gateway */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={handleCheckout}
        totalDue={Math.max(0, cart.reduce((t, i) => t + (i.price * i.quantity), 0) - discount)}
      />
    </div>
  );
};

export default SalesPage;
