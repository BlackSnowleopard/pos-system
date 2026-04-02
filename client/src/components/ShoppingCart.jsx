import React from 'react';

/**
 * ShoppingCart Component
 * 
 * This composes the "Right Panel" of the Sales Terminal.
 * It's considered a "dumb" or "presentation" component because it doesn't 
 * manage its own state (like fetching data). It solely depends on the 'props' 
 * passed down from its parent (SalesPage) and renders them visually.
 * 
 * @param {Array} cart - Array of items the user chose to buy
 * @param {Function} updateQuantity - Callback to change how many of a specific item we want
 * @param {Function} removeItem - Callback to completely remove an item from the cart
 * @param {Number} discount - Flat monetary discount being applied
 * @param {Function} setDiscount - Callback to change the active discount
 * @param {Function} onInitiateCheckout - Callback to open the payment modal
 * @param {Boolean} isProcessing - True if we are waiting for the backend to respond
 */
const ShoppingCart = ({ 
  cart, 
  updateQuantity, 
  removeItem, 
  discount, 
  setDiscount, 
  onInitiateCheckout,
  isProcessing
}) => {

  // Auto-tally the subtotal by multiplying every item's price by its quantity
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculate final total (preventing it from dropping below $0)
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="shopping-cart">
      <div className="cart-header">
        <h3>Current Sale</h3>
        <span className="item-count">{cart.length} unique items</span>
      </div>

      {/* Cart Items List */}
      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart">Cart is empty. Scan an item to begin.</div>
        ) : (
          cart.map(item => (
            <div key={item.product_id} className="cart-item">
              <div className="item-info">
                <strong>{item.product_name}</strong>
                <div className="item-price">${Number(item.price).toFixed(2)} each</div>
              </div>
              
              <div className="item-controls">
                {/* Plus / Minus quantity controls */}
                <button onClick={() => updateQuantity(item.product_id, -1)}>-</button>
                <span className="qty">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product_id, 1)}>+</button>
                
                {/* Trash button */}
                <button className="remove-btn" onClick={() => removeItem(item.product_id)}>🗑️</button>
              </div>
              
              <div className="item-total">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Checkout Footer block */}
      <div className="cart-footer">
        <div className="totals-row">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="totals-row discount-row">
          <span>Discount ($):</span>
          <input 
            type="number" 
            min="0" 
            step="0.01" 
            value={discount} 
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="discount-input"
          />
        </div>

        <div className="totals-row grand-total">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {/* Big Checkout Action Button */}
        <button 
          className="btn-checkout" 
          disabled={cart.length === 0 || isProcessing}
          onClick={onInitiateCheckout}
          style={{ marginTop: '1.5rem' }}
        >
          {isProcessing ? 'Processing Transaction...' : `Charge $${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

export default ShoppingCart;
