import React, { useState, useEffect } from 'react';

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

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <h2>Purchase History: {customer.name}</h2>
        <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
          Total Loyalty Points: <strong>{customer.loyalty_points} pts</strong>
        </p>

        {isLoading ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', background: '#edf2f7', borderRadius: '8px' }}>
            <p>No past purchases found for this customer.</p>
          </div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Discount</th>
                  <th>Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {history.map(receipt => (
                  <tr key={receipt.sale_id}>
                    <td>#{receipt.sale_id}</td>
                    <td>{new Date(receipt.created_at).toLocaleString()}</td>
                    <td>
                      <span style={{ fontSize: '0.8rem', padding: '2px 6px', background: '#e2e8f0', borderRadius: '4px' }}>
                        {receipt.payment_method}
                      </span>
                    </td>
                    <td className="text-danger">
                      {Number(receipt.discount_applied) > 0 ? `-$${receipt.discount_applied}` : '-'}
                    </td>
                    <td style={{ fontWeight: 'bold' }}>${Number(receipt.total_amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: '2rem' }}>
          <button type="button" className="btn-primary" onClick={onClose} style={{ width: '100%' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerHistoryModal;
