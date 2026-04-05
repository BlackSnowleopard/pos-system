import React, { useState, useEffect } from 'react';
import { Wallet, Ticket, Call, CloseSquare, ShieldDone } from 'react-iconly';

const PaymentModal = ({ isOpen, onClose, onConfirm, totalDue }) => {
  const [method, setMethod] = useState('CASH');
  const [amountTendered, setAmountTendered] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [changeDue, setChangeDue] = useState(0);

  useEffect(() => {
    if (method === 'CASH') {
      const tendered = Number(amountTendered);
      if (tendered >= totalDue) {
        setChangeDue(tendered - totalDue);
      } else {
        setChangeDue(0);
      }
    } else {
      setAmountTendered(totalDue.toString());
      setChangeDue(0);
    }
  }, [amountTendered, totalDue, method]);

  useEffect(() => {
    if (isOpen) {
      setMethod('CASH');
      setAmountTendered(totalDue.toString());
      setReferenceId('');
    }
  }, [isOpen, totalDue]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(amountTendered) < totalDue) {
       alert("Amount tendered cannot be less than total due!");
       return;
    }
    
    onConfirm({
      method,
      amountTendered: Number(amountTendered),
      referenceId: method !== 'CASH' ? referenceId : null
    });
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
                  ₵{changeDue.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {method !== 'CASH' && (
            <div className="fade-in">
              <div className="form-group">
                <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{method === 'CARD' ? 'Last 4 Digits / Auth Code' : 'Transaction / Reference ID'}</label>
                <input 
                  type="text" 
                  className="input-field"
                  style={{ background: 'rgba(0,0,0,0.2)' }}
                  value={referenceId} 
                  onChange={(e) => setReferenceId(e.target.value)} 
                  required 
                  placeholder="Enter reference info..."
                />
              </div>
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '1rem' }}>
                Authorization processed for <strong>₵{totalDue.toFixed(2)}</strong>
              </div>
            </div>
          )}

          <div className="modal-actions" style={{ borderTop: 'none', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1, padding: '14px' }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 2, padding: '14px', justifyContent: 'center' }}>
                <ShieldDone set="bulk" size={18} /> Finalize Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
