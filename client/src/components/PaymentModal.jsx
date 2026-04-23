import React, { useState } from 'react';
import { Wallet, Ticket, Call, CloseSquare, ShieldDone } from 'react-iconly';

const PaymentModal = ({ isOpen, onClose, onConfirm, totalDue }) => {
  const [method, setMethod] = useState('CASH');
  const [amountTendered, setAmountTendered] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Update state when modal opens
  const [lastIsOpen, setLastIsOpen] = useState(false);
  if (isOpen && !lastIsOpen) {
    setMethod('CASH');
    setAmountTendered(totalDue.toString());
    setReferenceId('');
    setCustomerPhone('');
    setIsProcessingPayment(false);
    setLastIsOpen(true);
  } else if (!isOpen && lastIsOpen) {
    setLastIsOpen(false);
  }

  // Calculate change due for cash payments
  const changeDueValue = method === 'CASH' 
    ? Number(amountTendered) >= totalDue 
      ? Number(amountTendered) - totalDue 
      : 0
    : 0;

  // Paystack verification and confirmation
  const handlePaystackSuccess = async (response, currentMethod, currentPhone, currentEmail) => {
    try {
      setIsProcessingPayment(true);
      
      const verifyResponse = await fetch('http://localhost:5000/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('posToken')}`
        },
        body: JSON.stringify({ reference: response.reference })
      });
      
      const verifyResult = await verifyResponse.json();
      
      if (!verifyResult.success) {
        alert('Payment verification failed. Please contact support.');
        setIsProcessingPayment(false);
        return;
      }

      onConfirm({
        method: currentMethod,
        amountTendered: totalDue,
        referenceId: response.reference,
        customerPhone: currentPhone,
        customerEmail: currentMethod === 'CARD' ? currentEmail : null
      });
      setIsProcessingPayment(false);
      onClose();
    } catch (error) {
      console.error('Verification error:', error);
      alert('Error verifying payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const handlePaystackClose = () => {
    setIsProcessingPayment(false);
    // Payment was cancelled - don't clear cart
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (method === 'CASH') {
      if (Number(amountTendered) < totalDue) {
         alert("Amount tendered cannot be less than total due!");
         return;
      }
      onConfirm({
        method: 'CASH',
        amountTendered: Number(amountTendered),
        referenceId: null
      });
    } else if (method === 'MOBILE_MONEY') {
      // Validate Ghana phone number (10 digits starting with 0)
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(customerPhone)) {
        alert('Please enter a valid Ghana mobile number (10 digits starting with 0)');
        return;
      }
      
      setIsProcessingPayment(true);
      const paymentConfig = {
        reference: (new Date()).getTime().toString(),
        email: 'pos-system@sopl.com',
        amount: Math.round(totalDue * 100),
        currency: 'GHS',
        channels: ['mobile_money'],
        label: `POS Sale - Mobile`,
        metadata: {
          phone_number: customerPhone,
          custom_fields: [
            { display_name: 'Payment Method', variable_name: 'payment_method', value: 'MOBILE_MONEY' },
            { display_name: 'Phone Number', variable_name: 'customer_phone', value: customerPhone }
          ]
        },
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_fcef6f83711548a02a8ef7de0e3b98a95b815a31'
      };
      
      console.log('Initializing Mobile Money Paystack with:', { ...paymentConfig, publicKey: 'REDACTED' });
      
      try {
        if (!window.PaystackPop) {
          throw new Error('Paystack script not loaded. Please check your internet connection.');
        }

        // Initialize Paystack payment using the window object directly to ensure latest config
        const handler = window.PaystackPop.setup({
          ...paymentConfig,
          key: paymentConfig.publicKey,
          callback: (response) => {
            console.log('Paystack callback received:', response);
            handlePaystackSuccess(response, 'MOBILE_MONEY', customerPhone, referenceId);
          },
          onClose: () => {
            console.log('Paystack window closed');
            handlePaystackClose();
          },
        });
        handler.openIframe();
      } catch (err) {
        console.error('Paystack initialization error:', err);
        alert(`Could not initialize Paystack: ${err.message}`);
        setIsProcessingPayment(false);
      }
    } else if (method === 'CARD') {
      // For card payments, we'd also use Paystack but without phone number
      setIsProcessingPayment(true);
      const paymentConfig = {
        reference: (new Date()).getTime().toString(),
        email: referenceId || 'pos-system@sopl.com',
        amount: Math.round(totalDue * 100),
        currency: 'GHS',
        channels: ['card'],
        label: `POS Sale - Card`,
        metadata: {
          custom_fields: [
            { display_name: 'Payment Method', variable_name: 'payment_method', value: 'CARD' }
          ]
        },
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_fcef6f83711548a02a8ef7de0e3b98a95b815a31'
      };
      
      console.log('Initializing Card Paystack with:', { ...paymentConfig, publicKey: 'REDACTED' });
      
      try {
        // Initialize Paystack payment
        const handler = window.PaystackPop.setup({
          ...paymentConfig,
          key: paymentConfig.publicKey,
          callback: (response) => handlePaystackSuccess(response, 'CARD', customerPhone, referenceId),
          onClose: () => handlePaystackClose(),
        });
        handler.openIframe();
      } catch (err) {
        console.error('Paystack initialization error:', err);
        alert('Could not initialize Paystack. Please check your internet connection or keys.');
        setIsProcessingPayment(false);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-pro glass fade-in" style={{ maxWidth: '450px' }}>
        <button 
           onClick={onClose} 
           style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
        >
          <CloseSquare set="bulk" size={20} />
        </button>

        <h2 style={{ marginBottom: '2.5rem', justifyContent: 'center' }}>
          <Wallet set="bulk" primaryColor="var(--primary)" size={24} /> Complete Checkout
        </h2>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Grand Total Due</div>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>₵{totalDue.toFixed(2)}</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Payment Method</label>
            <div className="payment-methods-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div 
                className={`pro-card glass hover-glow ${method === 'CASH' ? 'active-method' : ''}`}
                style={{ 
                  padding: '12px', 
                  cursor: 'pointer', 
                  textAlign: 'center',
                  background: method === 'CASH' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                  border: method === 'CASH' ? '1px solid var(--primary)' : '1px solid var(--border)'
                }}
                onClick={() => setMethod('CASH')}
              >
                <Wallet set="bulk" size={20} style={{ marginBottom: '6px' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Cash</div>
              </div>

              <div 
                className={`pro-card glass hover-glow ${method === 'CARD' ? 'active-method' : ''}`}
                style={{ 
                   padding: '12px', 
                   cursor: 'pointer', 
                   textAlign: 'center',
                   background: method === 'CARD' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                   border: method === 'CARD' ? '1px solid var(--primary)' : '1px solid var(--border)'
                }}
                onClick={() => setMethod('CARD')}
              >
                <Ticket set="bulk" size={20} style={{ marginBottom: '6px' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Card</div>
              </div>

              <div 
                className={`pro-card glass hover-glow ${method === 'MOBILE_MONEY' ? 'active-method' : ''}`}
                style={{ 
                   padding: '12px', 
                   cursor: 'pointer', 
                   textAlign: 'center',
                   background: method === 'MOBILE_MONEY' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                   border: method === 'MOBILE_MONEY' ? '1px solid var(--primary)' : '1px solid var(--border)'
                }}
                onClick={() => setMethod('MOBILE_MONEY')}
              >
                <Call set="bulk" size={20} style={{ marginBottom: '6px' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Mobile</div>
              </div>
            </div>
          </div>

          {method === 'CASH' && (
            <div className="fade-in">
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Amount Tendered</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>₵</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="input-field"
                    style={{ fontSize: '1.5rem', textAlign: 'right', paddingRight: '12px' }}
                    min={totalDue}
                    value={amountTendered} 
                    onChange={(e) => setAmountTendered(e.target.value)} 
                    required 
                    autoFocus
                  />
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '12px', border: '1px dashed var(--primary-glow)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Change Due</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>
                  ₵{changeDueValue.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {method === 'MOBILE_MONEY' && (
            <div className="fade-in">
              <div className="form-group">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Customer Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>+233</span>
                  <input 
                    type="tel" 
                    className="input-field"
                    style={{ background: 'rgba(0,0,0,0.2)', paddingLeft: '50px' }}
                    value={customerPhone} 
                    onChange={(e) => setCustomerPhone(e.target.value)} 
                    required 
                    placeholder="053XXXXXXX"
                    pattern="0[2-9][0-9]{8}"
                  />
                </div>
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  Customer will receive a USSD prompt to confirm payment of <strong>₵{totalDue.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}

          {method === 'CARD' && (
            <div className="fade-in">
              <div className="form-group">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cardholder Email (Required)</label>
                <input 
                  type="email" 
                  className="input-field"
                  style={{ background: 'rgba(0,0,0,0.2)' }}
                  value={referenceId} 
                  onChange={(e) => setReferenceId(e.target.value)} 
                  required 
                  placeholder="customer@example.com"
                />
              </div>
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '1rem' }}>
                Customer will be redirected to secure payment page for <strong>₵{totalDue.toFixed(2)}</strong>
              </div>
            </div>
          )}

          <div className="modal-actions" style={{ borderTop: 'none', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1, padding: '14px' }} disabled={isProcessingPayment}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 2, padding: '14px', justifyContent: 'center' }} disabled={isProcessingPayment}>
              {isProcessingPayment ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', marginRight: '8px', animation: 'spin 1s linear infinite' }}></div>
                  Processing...
                </>
              ) : (
                <>
                  {method === 'CASH' ? <ShieldDone set="bulk" size={18} /> : <Wallet set="bulk" size={18} />}
                  {method === 'CASH' ? 'Finalize Sale' : 'Pay with Paystack'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
