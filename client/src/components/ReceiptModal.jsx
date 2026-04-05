import React from 'react';
import { Paper, CloseSquare, ShieldDone, Ticket } from 'react-iconly';

const ReceiptModal = ({ isOpen, onClose, receiptData }) => {
  if (!isOpen || !receiptData) return null;

  const { header, items } = receiptData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay hide-on-print fade-in">
      <div className="modal-pro glass" style={{ maxWidth: '420px', padding: '0', overflow: 'hidden' }}>
        
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
            <Ticket set="bulk" primaryColor="var(--primary)" size={18} /> Sale Successful
          </h3>
          <button 
             onClick={onClose} 
             style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <CloseSquare set="bulk" size={20} />
          </button>
        </div>

        {/* The Actual Digital Paper Receipt */}
        <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.1)' }}>
          <div id="printable-receipt" className="receipt-paper" style={{ background: 'white', color: '#1e293b', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <div className="receipt-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.25rem' }}>POS SYSTEM PRO</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>123 Storefront Avenue</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '1rem' }}>Tel: +1 (555) 012-3456</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '8px 0', margin: '1rem 0' }}>
                <span>ID: #{header.sale_id}</span>
                <span>{new Date(header.created_at).toLocaleDateString()} {new Date(header.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <table className="receipt-items" style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '8px 0' }}>Description</th>
                  <th style={{ textAlign: 'center', padding: '8px 0' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '8px 0' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'left', padding: '6px 0' }}>{item.product_name}</td>
                    <td style={{ textAlign: 'center', padding: '6px 0' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '6px 0' }}>₵{(item.quantity * item.price_at_sale).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="receipt-financials" style={{ fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Subtotal:</span>
                <span>₵{(Number(header.total_amount) + Number(header.discount_applied)).toFixed(2)}</span>
              </div>
              {Number(header.discount_applied) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#dc2626' }}>
                  <span>Discount:</span>
                  <span>-₵{Number(header.discount_applied).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '2px solid #1e293b', fontWeight: 900, fontSize: '1.1rem' }}>
                <span>TOTAL:</span>
                <span>₵{Number(header.total_amount).toFixed(2)}</span>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>PAID BY {header.payment_method}</span>
                  <span>₵{Number(header.amount_tendered).toFixed(2)}</span>
                </div>
                {header.payment_method === 'CASH' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>CHANGE DUE:</span>
                    <span>₵{Number(header.change_returned).toFixed(2)}</span>
                  </div>
                )}
                {header.transaction_reference && (
                  <div style={{ marginTop: '4px', opacity: 0.7 }}>Ref: {header.transaction_reference}</div>
                )}
              </div>
            </div>

            <div className="receipt-footer" style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.7rem', opacity: 0.8 }}>
              <div style={{ marginBottom: '8px' }}>Staff: {header.cashier_name}</div>
              {header.customer_name ? (
                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '4px', marginTop: '10px' }}>
                  <div style={{ fontWeight: 700 }}>Customer: {header.customer_name}</div>
                  <div>Points Earned: +{Math.floor(header.total_amount)}</div>
                  <div>New Balance: {header.loyalty_points}</div>
                </div>
              ) : (
                <div style={{ marginTop: '10px', fontStyle: 'italic' }}>Join our loyalty program to earn points!</div>
              )}
              <div style={{ marginTop: '1.5rem', fontWeight: 900, letterSpacing: '1px' }}>THANK YOU FOR YOUR BUSINESS!</div>
            </div>
          </div>
        </div>

        {/* Action Buttons (These won't be printed) */}
        <div className="modal-actions hide-on-print" style={{ padding: '1.5rem', marginTop: '0', background: 'rgba(15, 23, 42, 0.5)' }}>
          <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Done</button>
          <button type="button" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handlePrint}>
            <Paper set="bulk" size={18} /> Print Thermal Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
