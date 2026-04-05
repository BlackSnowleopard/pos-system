import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../commons/AuthContext';
import { 
  Graph, 
  Buy, 
  Category, 
  TimeCircle, 
  ArrowUpSquare, 
  Chart,
  User,
  Danger,
  Calendar
} from 'react-iconly';

const ReportsPage = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState({
    total_value: 0,
    total_products: 0,
    low_stock_count: 0
  });
  const [cashierPerformance, setCashierPerformance] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('posToken');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [sumRes, topRes, statusRes, perfRes, recRes] = await Promise.all([
          fetch('http://localhost:5000/api/reports/summary', { headers }),
          fetch('http://localhost:5000/api/reports/top-products', { headers }),
          fetch('http://localhost:5000/api/reports/inventory-status', { headers }),
          fetch('http://localhost:5000/api/reports/cashier-performance', { headers }),
          fetch('http://localhost:5000/api/reports/recent-sales', { headers })
        ]);

        if (sumRes.ok) setSummary(await sumRes.json());
        if (topRes.ok) setTopProducts(await topRes.json());
        if (statusRes.ok) setInventoryStatus(await statusRes.json());
        if (perfRes.ok) setCashierPerformance(await perfRes.json());
        if (recRes.ok) setRecentSales(await recRes.json());
        
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [token]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-dim)' }}>
      <div className="fade-in">Analyzing store data...</div>
    </div>
  );

  return (
    <div className="reports-view fade-in">
      {/* KPI Cards Section */}
      <section className="kpi-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="pro-card glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Daily Revenue</span>
            <Graph set="bulk" primaryColor="var(--success)" size={24} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>₵{summary?.today.revenue.toFixed(2) || '0.00'}</div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
             From {summary?.today.count} transactions
          </div>
        </div>

        <div className="pro-card glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Total Transactions</span>
            <Buy set="bulk" primaryColor="var(--primary)" size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{summary?.month.count || 0}</div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
             This month's volume
          </div>
        </div>

        <div className="pro-card glass" style={{ border: inventoryStatus.low_stock_count > 0 ? '1px solid rgba(248, 113, 113, 0.3)' : '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Low Stock Alerts</span>
            <Danger set="bulk" primaryColor={inventoryStatus.low_stock_count > 0 ? 'var(--error)' : 'var(--success)'} size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: inventoryStatus.low_stock_count > 0 ? 'var(--error)' : 'var(--success)' }}>
             {inventoryStatus.low_stock_count}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
             Items requiring attention
          </div>
        </div>

        <div className="pro-card glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Inventory Value</span>
            <Category set="bulk" primaryColor="var(--secondary)" size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>₵{inventoryStatus.total_value.toFixed(2)}</div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
             Current assets valuation
          </div>
        </div>
      </section>

      {/* Analytics Tables Section */}
      <div className="analytics-details" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        
        <section className="pro-card glass" style={{ gridColumn: 'span 7' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User set="bulk" primaryColor="var(--primary)" size={18} /> Staff Performance
          </h3>
          <div className="data-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Cashier</th>
                  <th style={{ textAlign: 'center' }}>Sales</th>
                  <th style={{ textAlign: 'right' }}>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {cashierPerformance.map((c, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{c.cashier_name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{c.transaction_count} units</span>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 700 }}>₵{Number(c.total_revenue).toFixed(2)}</td>
                  </tr>
                ))}
                {cashierPerformance.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>No activity found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="pro-card glass" style={{ gridColumn: 'span 5' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Chart set="bulk" primaryColor="var(--secondary)" size={18} /> Best Sellers
          </h3>
          <div className="data-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'right' }}>Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{p.product_name}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="badge badge-success">{p.total_sold} units</span>
                    </td>
                  </tr>
                ))}
                {topProducts.length === 0 && <tr><td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>No sales yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="pro-card glass" style={{ gridColumn: 'span 12' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar set="light" primaryColor="var(--accent)" size={18} /> Recent Transactions History
          </h3>
          <div className="data-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Timestamp</th>
                  <th>Staff Member</th>
                  <th>Method</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.sale_id}>
                    <td style={{ color: 'var(--text-dim)', fontFamily: 'monospace' }}>#{sale.sale_id}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(sale.created_at).toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>{sale.cashier_name}</td>
                    <td><span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{sale.payment_method}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}>₵{Number(sale.total_amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ReportsPage;
