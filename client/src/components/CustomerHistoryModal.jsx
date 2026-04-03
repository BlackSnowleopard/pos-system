import React, { useState, useEffect } from 'react';
import { TimeCircle, ShieldDone, CloseSquare, Calendar, Ticket, Wallet, Call } from 'react-iconly';

const CustomerHistoryModal = ({ isOpen, onClose, customer }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && customer) {
      setIsLoading(true);
      const token = localStorage.getItem('posToken');
      
      fetch(`http://localhost:5000/api/customers/${customer.customer_id}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
    }
  }, [isOpen, customer]);

  if (!isOpen || !customer) return null;

  const getMethodIcon = (method) => {
    switch(method) {
      case 'CARD': return <Ticket set="bulk" size={14} />;
      case 'MOBILE_MONEY': return <Call set="bulk" size={14} />;
      default: return <Wallet set="bulk" size={14} />;
    }
  };

  return (
    <div className="modal-overlay fade-in">
      <div className="modal-pro glass" style={{ maxWidth: '700px', width: '95%' }}>
        <button 
           onClick={onClose} 
           style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
        >
          <CloseSquare set="bulk" size={20} />
        </button>

        <h2 style={{ marginBottom: '0.5rem' }}>
          <TimeCircle set="bulk" primaryColor="var(--primary)" size={24} /> Purchase History
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{customer.name}</div>
            <div className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldDone set="bulk" size={14} /> {customer.loyalty_points} Points Total
            </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
             Fetching transaction logs...
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed var(--border)', color: 'var(--text-dim)' }}>
            <p>No past purchases found for this member.</p>
          </div>
        ) : (
          <div className="data-table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Date & Time</th>
                  <th>Method</th>
                  <th style={{ textAlign: 'right' }}>Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {history.map(receipt => (
                  <tr key={receipt.sale_id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>#{receipt.sale_id}</td>
                    <td>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                          <Calendar set="light" size={12} primaryColor="var(--text-dim)" />
                          {new Date(receipt.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                       </div>
                    </td>
                    <td>
                      <div className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {getMethodIcon(receipt.payment_method)} {receipt.payment_method}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
                      ${Number(receipt.total_amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-actions" style={{ borderTop: 'none', marginTop: '1rem' }}>
          <button type="button" className="btn-primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerHistoryModal;
