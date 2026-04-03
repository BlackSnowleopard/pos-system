import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../commons/AuthContext';
import { Danger, TimeCircle, Setting, Category } from 'react-iconly';

const InventoryPage = () => {
  const { user } = useContext(AuthContext);
  const [lowStock, setLowStock] = useState([]);
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Adjustment Form State
  const [adjustData, setAdjustData] = useState({
    product_id: '',
    change_type: 'RESTOCK',
    quantity_changed: '',
    description: ''
  });

  const token = localStorage.getItem('posToken');
  const canModify = user?.role === 'Administrator' || user?.role === 'Manager';

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [lowRes, logsRes, prodRes] = await Promise.all([
        fetch('http://localhost:5000/api/inventory/low-stock', { headers }),
        fetch('http://localhost:5000/api/inventory/logs', { headers }),
        fetch('http://localhost:5000/api/products', { headers })
      ]);

      if (lowRes.ok) setLowStock(await lowRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());

    } catch (error) {
      console.error('Error fetching inventory data', error);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustData.product_id || !adjustData.quantity_changed) {
      return alert('Please fill in required fields');
    }

    try {
      const response = await fetch('http://localhost:5000/api/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adjustData)
      });
      
      const data = await response.json();
      if (response.ok) {
        alert(`Success! New stock level: ${data.newQuantity}`);
        setAdjustData({ product_id: '', change_type: 'RESTOCK', quantity_changed: '', description: '' });
        fetchData();
      } else {
        alert(data.error || 'Failed to adjust inventory');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="inventory-view fade-in">
      <div className="inventory-grid">
        {/* Panel 1: Low Stock Alerts */}
        <section className="pro-card glass">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: 'var(--error)' }}>
            <Danger set="bulk" primaryColor="var(--error)" size={20} /> Low Stock Alerts
          </h3>
          <div className="data-table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.length === 0 ? (
                  <tr><td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Inventory is healthy.</td></tr>
                ) : (
                  lowStock.map(item => (
                    <tr key={item.product_id}>
                      <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                      <td>
                        <span className="badge badge-danger">
                          {item.quantity} left (Min: {item.low_stock_threshold || 10})
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Panel 2: Adjustment Form */}
        {canModify && (
          <section className="pro-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <Setting set="bulk" primaryColor="var(--primary)" size={20} /> Stock Adjustment
            </h3>
            <form onSubmit={handleAdjustSubmit} className="product-form">
              <div className="form-group">
                <label style={{ color: 'var(--text-muted)' }}>Select Target Product</label>
                <select 
                  className="input-field"
                  value={adjustData.product_id} 
                  onChange={(e) => setAdjustData({...adjustData, product_id: e.target.value})}
                  required
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.product_id} value={p.product_id}>{p.product_name} (Current: {p.quantity})</option>
                  ))}
                </select>
              </div>
              <div className="form-group row" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <div className="col" style={{ flex: 1 }}>
                  <label style={{ color: 'var(--text-muted)' }}>Action</label>
                  <select 
                    className="input-field"
                    value={adjustData.change_type}
                    onChange={(e) => setAdjustData({...adjustData, change_type: e.target.value})}
                  >
                    <option value="RESTOCK">Restock (Add)</option>
                    <option value="ADJUSTMENT">Manual Fix</option>
                    <option value="DAMAGE">Damage (Subtract)</option>
                  </select>
                </div>
                <div className="col" style={{ flex: 1 }}>
                  <label style={{ color: 'var(--text-muted)' }}>Change Qty</label>
                  <input 
                    type="number" 
                    className="input-field"
                    placeholder="e.g. 50"
                    value={adjustData.quantity_changed}
                    onChange={(e) => setAdjustData({...adjustData, quantity_changed: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                <label style={{ color: 'var(--text-muted)' }}>Reference Note</label>
                <input 
                  type="text" 
                  className="input-field"
                  placeholder="Reason for adjustment..."
                  value={adjustData.description}
                  onChange={(e) => setAdjustData({...adjustData, description: e.target.value})}
                />
              </div>
              <button type="submit" className="btn-primary" style={{width: '100%', justifyContent: 'center'}}>
                <Category set="bulk" primaryColor="currentColor" size={18} /> Apply Changes
              </button>
            </form>
          </section>
        )}

        {/* Panel 3: History Log */}
        <section className="pro-card glass full-width" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <TimeCircle set="bulk" primaryColor="var(--secondary)" size={20} /> Stock Movement history
          </h3>
          <div className="data-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Product</th>
                  <th>Performed By</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No logs recorded.</td></tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.log_id}>
                      <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{new Date(log.created_at).toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>{log.product_name}</td>
                      <td>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                          {log.user_name || 'System'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${log.change_type === 'DAMAGE' ? 'badge-danger' : 'badge-success'}`}>
                            {log.change_type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {log.quantity_changed > 0 ? `+${log.quantity_changed}` : log.quantity_changed}
                      </td>
                      <td style={{ color: 'var(--text-dim)' }}>{log.description || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InventoryPage;
