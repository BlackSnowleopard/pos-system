import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../commons/AuthContext';
import { Link } from 'react-router-dom';
import '../assets/css/styles.css';

const InventoryPage = () => {
  const { user, logout } = useContext(AuthContext);
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
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-nav">
            <h1>Inventory Management</h1>
            <nav className="top-nav">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/sales">Sales</Link>
                <Link to="/products">Products</Link>
                <Link to="/inventory" className="active">Inventory</Link>
            </nav>
        </div>
        <div className="user-info">
          <span>{user?.name} ({user?.role})</span>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </header>

      <main className="dashboard-content inventory-grid">
        {/* Panel 1: Low Stock Alerts */}
        <section className="inventory-panel">
          <h3>🚨 Low Stock Alerts</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Threshold</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.length === 0 ? (
                <tr><td colSpan="3" className="text-center">No low stock items!</td></tr>
              ) : (
                lowStock.map(item => (
                  <tr key={item.product_id} className="row-warning">
                    <td>{item.product_name}</td>
                    <td><span className="badge badge-danger">{item.quantity}</span></td>
                    <td>{item.low_stock_threshold || 10}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* Panel 2: Adjustment Form */}
        {canModify && (
          <section className="inventory-panel">
            <h3>📦 Stock Adjustment</h3>
            <form onSubmit={handleAdjustSubmit} className="product-form">
              <div className="form-group">
                <label>Select Product</label>
                <select 
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
              <div className="form-group row">
                <div className="col">
                  <label>Change Type</label>
                  <select 
                    value={adjustData.change_type}
                    onChange={(e) => setAdjustData({...adjustData, change_type: e.target.value})}
                  >
                    <option value="RESTOCK">Restock (Add)</option>
                    <option value="ADJUSTMENT">Adjustment</option>
                    <option value="DAMAGE">Damage (Subtract)</option>
                  </select>
                </div>
                <div className="col">
                  <label>Quantity Change</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 50 or -5"
                    value={adjustData.quantity_changed}
                    onChange={(e) => setAdjustData({...adjustData, quantity_changed: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description / Reason</label>
                <input 
                  type="text" 
                  value={adjustData.description}
                  onChange={(e) => setAdjustData({...adjustData, description: e.target.value})}
                />
              </div>
              <button type="submit" className="btn-primary" style={{width: '100%'}}>Apply Adjustment</button>
            </form>
          </section>
        )}

        {/* Panel 3: History Log */}
        <section className="inventory-panel full-width">
          <h3>📜 Stock Movement History</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>User</th>
                <th>Action</th>
                <th>Qty</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="6" className="text-center">No logs found.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.log_id}>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td>{log.product_name}</td>
                    <td>{log.user_name || 'System'}</td>
                    <td>
                        <span className={`badge ${log.change_type === 'DAMAGE' ? 'badge-danger' : 'badge-success'}`}>
                            {log.change_type}
                        </span>
                    </td>
                    <td>{log.quantity_changed > 0 ? `+${log.quantity_changed}` : log.quantity_changed}</td>
                    <td>{log.description || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default InventoryPage;
