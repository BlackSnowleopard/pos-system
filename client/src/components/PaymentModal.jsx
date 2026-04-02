import React, { useState, useEffect } from 'react';

const PaymentModal = ({ isOpen, onClose, onConfirm, totalDue }) => {
  const [method, setMethod] = useState('CASH');
  const [amountTendered, setAmountTendered] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [changeDue, setChangeDue] = useState(0);

  // Auto-calculate change when amount tendered or total changes
  useEffect(() => {
    if (method === 'CASH') {
      const tendered = Number(amountTendered);
      if (tendered >= totalDue) {
        setChangeDue(tendered - totalDue);
      } else {
        setChangeDue(0);
      }
    } else {
      // For Card/Mobile, exact amount is assumed
      setAmountTendered(totalDue.toString());
      setChangeDue(0);
    }
  }, [amountTendered, totalDue, method]);

  // Reset form when modal opens
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
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <h2>Complete Payment</h2>
        <h3 style={{ textAlign: 'center', fontSize: '2rem', margin: '1rem 0' }}>
            Total: ${totalDue.toFixed(2)}
        </h3>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="payment-methods" style={{ margin: '1.5rem 0' }}>
            <label className={method === 'CASH' ? 'active' : ''}>
              <input type="radio" checked={method === 'CASH'} onChange={() => setMethod('CASH')} /> Cash
            </label>
            <label className={method === 'CARD' ? 'active' : ''}>
              <input type="radio" checked={method === 'CARD'} onChange={() => setMethod('CARD')} /> Card
            </label>
            <label className={method === 'MOBILE_MONEY' ? 'active' : ''}>
              <input type="radio" checked={method === 'MOBILE_MONEY'} onChange={() => setMethod('MOBILE_MONEY')} /> Mobile
            </label>
          </div>

          {method === 'CASH' && (
            <>
              <div className="form-group">
                <label>Amount Tendered ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min={totalDue}
                  value={amountTendered} 
                  onChange={(e) => setAmountTendered(e.target.value)} 
                  required 
                  autoFocus
                  style={{ fontSize: '1.5rem', textAlign: 'center' }}
                />
              </div>
              <div className="form-group" style={{ textAlign: 'center', margin: '1rem 0' }}>
                <label>Change Due</label>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: changeDue > 0 ? '#38a169' : '#718096' }}>
                  ${changeDue.toFixed(2)}
                </div>
              </div>
            </>
          )}

          {method !== 'CASH' && (
            <>
              <div className="form-group">
                <label>{method === 'CARD' ? 'Auth Code / Last 4 Digits' : 'Mobile Phone / TXN ID'}</label>
                <input 
                  type="text" 
                  value={referenceId} 
                  onChange={(e) => setReferenceId(e.target.value)} 
                  required 
                  placeholder="Enter reference..."
                />
              </div>
              <div style={{ textAlign: 'center', color: '#718096', marginBottom: '1rem' }}>
                Amount will be exact (${totalDue.toFixed(2)})
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1, padding: '1rem' }}>
                Finalize Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
