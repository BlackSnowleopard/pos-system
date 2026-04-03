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
  onInitiateCheckout,
  isProcessing
}) => {

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="cart-panel fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="cart-header glass" style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem' }}>
          <Buy set="bulk" primaryColor="var(--primary)" size={20} /> Active Transaction
        </h3>
        <span className="badge badge-success" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
          {cart.length} items
        </span>
      </div>

      {/* Cart Items List */}
      <div className="cart-items" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {cart.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', textAlign: 'center' }}>
            <Buy set="bulk" size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p>Cart is currently empty.</p>
            <p style={{ fontSize: '0.8rem' }}>Scan or select products to begin.</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.product_id} className="cart-item glass" style={{ 
              marginBottom: '0.75rem', 
              padding: '1rem', 
              display: 'grid', 
              gridTemplateColumns: '1fr auto auto', 
              alignItems: 'center',
              gap: '12px',
              border: '1px solid rgba(255,255,255,0.03)'
            }}>
              <div className="item-info">
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.product_name}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>${Number(item.price).toFixed(2)} / unit</div>
              </div>
              
              <div className="item-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px' }}>
                <button 
                  onClick={() => updateQuantity(item.product_id, -1)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                >
                  <MinusIcon size={14} />
                </button>
                <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.product_id, 1)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                >
                  <Plus set="light" size={14} />
                </button>
              </div>
              
              <div className="item-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem', minWidth: '60px', textAlign: 'right' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                <button 
                  onClick={() => removeItem(item.product_id)}
                  style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', opacity: 0.6 }}
                >
                  <Delete set="bulk" size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Premium Checkout Footer */}
      <div className="cart-footer glass" style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(15, 23, 42, 0.95)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontSize: '0.9rem' }}>
            <Ticket set="bulk" size={14} /> Discount
          </span>
          <div style={{ position: 'relative', width: '100px' }}>
             <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>$</span>
             <input 
              type="number" 
              className="input-field"
              style={{ padding: '6px 8px 6px 20px', fontSize: '0.85rem', textAlign: 'right', background: 'rgba(0,0,0,0.2)' }}
              value={discount} 
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>
        </div>

        <div style={{ borderTop: '1px dotted var(--border)', margin: '1rem 0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Total Due</span>
          <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>${total.toFixed(2)}</span>
        </div>

        <button 
          className="btn-primary" 
          disabled={cart.length === 0 || isProcessing}
          onClick={onInitiateCheckout}
          style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1.1rem' }}
        >
          {isProcessing ? 'Processing...' : (
             <>
               <Wallet set="bulk" size={22} /> Complete Checkout
             </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ShoppingCart;
