import React from 'react';
import { Buy, Plus, Delete, Wallet, Ticket } from 'react-iconly';

// Custom Minimalist Minus Icon to match Iconly style
const MinusIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 12H18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShoppingCart = ({ 
  cart, 
  updateQuantity, 
  removeItem, 
  discount, 
  setDiscount, 
  discountType,
  setDiscountType,
  onInitiateCheckout,
  isProcessing,
  onClear
}) => {

  const subtotal = cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * discount) / 100 
    : discount;
  const total = Math.max(0, subtotal - discountAmount);

  return (
    <div className="sales-cart-panel fade-in">
      <div className="total-display">
        <div className="total-label">Total Due</div>
        <div className="total-amount">₵{total.toFixed(2)}</div>
      </div>

      <div className="cart-section">
        <div className="cart-section-header">
          <h4>Active Transaction</h4>
          <span className="badge badge-success">
            {cart.length} items
          </span>
        </div>
      </div>

      <div className="cart-items-list">
        {cart.length === 0 ? (
          <div className="cart-empty">
            <Buy set="bulk" size={48} />
            <p>Cart is currently empty.</p>
            <p style={{ fontSize: '0.75rem' }}>Scan or select products to begin.</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.product_id} className="cart-item">
              <div className="item-info">
                <div className="item-name">{item.product_name}</div>
                <div className="item-price-unit">₵{parseFloat(item.price).toFixed(2)} / unit</div>
              </div>
              
              <div className="item-qty-controls">
                <button onClick={() => updateQuantity(item.product_id, -1)}>
                  <MinusIcon size={14} />
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product_id, 1)}>
                  <Plus set="light" size={14} />
                </button>
              </div>
              
              <div className="item-total">
                ₵{(parseFloat(item.price) * item.quantity).toFixed(2)}
              </div>
              
              <button className="item-remove" onClick={() => removeItem(item.product_id)}>
                <Delete set="bulk" size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="cart-footer-section">
        <div className="cart-subtotals">
          <div className="subtotal-row">
            <span>Subtotal</span>
            <span>₵{subtotal.toFixed(2)}</span>
          </div>
          
          <div className="discount-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ticket set="bulk" size={14} /> 
              <span>Discount</span>
              <div className="discount-toggle">
                <button 
                  className={discountType === 'percentage' ? 'active' : ''}
                  onClick={() => setDiscountType('percentage')}
                >
                  %
                </button>
                <button 
                  className={discountType === 'currency' ? 'active' : ''}
                  onClick={() => setDiscountType('currency')}
                >
                  ₵
                </button>
              </div>
            </div>
            <div style={{ position: 'relative', width: '80px' }}>
              <input 
                type="number" 
                className="input-field"
                style={{ padding: '4px 8px', fontSize: '0.8rem', textAlign: 'right' }}
                value={discount} 
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="total-row">
            <span>Total Due</span>
            <span>₵{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="cart-action-buttons">
          <button 
            className="btn-secondary btn-cancel"
            onClick={onClear}
          >
            Clear
          </button>
          <button 
            className="btn-primary btn-checkout"
            disabled={cart.length === 0 || isProcessing}
            onClick={onInitiateCheckout}
          >
            {isProcessing ? '...' : <><Wallet set="bulk" size={18} /> Checkout</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
