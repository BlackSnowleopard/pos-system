import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../commons/AuthContext';
import { 
  Graph, 
  Danger,
  Wallet,
  Document,
  ArrowUpSquare,
  User,
  Buy,
  Category
} from 'react-iconly';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('posToken');

  const [timePeriod, setTimePeriod] = useState('today');
  const [summary, setSummary] = useState({ today: {}, week: {}, month: {} });
  const [inventoryStatus, setInventoryStatus] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [cashierPerformance, setCashierPerformance] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const isManager = user?.role === 'Administrator' || user?.role === 'Manager';

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        // Fetch all data in parallel
        const [summaryRes, inventoryRes, productsRes, cashierRes, recentRes] = await Promise.allSettled([
          fetch('http://localhost:5000/api/reports/summary', { headers }),
          fetch('http://localhost:5000/api/reports/inventory-status', { headers }),
          fetch('http://localhost:5000/api/reports/top-products', { headers }),
          fetch('http://localhost:5000/api/reports/cashier-performance', { headers }),
          fetch('http://localhost:5000/api/reports/recent-sales', { headers }),
        ]);

        if (summaryRes.status === 'fulfilled' && summaryRes.value.ok) {
          setSummary(await summaryRes.value.json());
        }
        if (inventoryRes.status === 'fulfilled' && inventoryRes.value.ok) {
          setInventoryStatus(await inventoryRes.value.json());
        }
        if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
          setTopProducts(await productsRes.value.json());
        }
        if (cashierRes.status === 'fulfilled' && cashierRes.value.ok) {
          setCashierPerformance(await cashierRes.value.json());
        }
        if (recentRes.status === 'fulfilled' && recentRes.value.ok) {
          setRecentSales(await recentRes.value.json());
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isManager) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [token, isManager]);

  // Get revenue for selected time period
  const getRevenue = () => {
    switch (timePeriod) {
      case 'week': return summary.week?.revenue || 0;
      case 'month': return summary.month?.revenue || 0;
      default: return summary.today?.revenue || 0;
    }
  };

  const getTransactionCount = () => {
    switch (timePeriod) {
      case 'week': return summary.week?.count || 0;
      case 'month': return summary.month?.count || 0;
      default: return summary.today?.count || 0;
    }
  };

  // Cashier-only view
  if (!isManager) {
    return (
      <div className="dashboard-view fade-in">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p style={{ color: 'var(--text-muted)' }}>Here's what you can do today.</p>
        </div>

        <div className="dashboard-kpi-grid">
          <Link to="/sales" className="pro-card hover-glow" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'var(--primary-glow)', padding: '14px', borderRadius: '12px' }}>
              <Buy set="bulk" primaryColor="var(--primary)" size={24} />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '2px' }}>Open Checkout</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Start a new transaction</p>
            </div>
          </Link>

          <Link to="/products" className="pro-card hover-glow" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(129, 140, 248, 0.15)', padding: '14px', borderRadius: '12px' }}>
              <Category set="bulk" primaryColor="var(--secondary)" size={24} />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '2px' }}>Browse Products</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>View the product catalog</p>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-view fade-in">
      {/* KPI Cards Row */}
      <div className="dashboard-kpi-grid">
        {/* Total Sales KPI */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Sales</span>
            <div className="time-filter">
              <button className={timePeriod === 'today' ? 'active' : ''} onClick={() => setTimePeriod('today')}>1D</button>
              <button className={timePeriod === 'week' ? 'active' : ''} onClick={() => setTimePeriod('week')}>1W</button>
              <button className={timePeriod === 'month' ? 'active' : ''} onClick={() => setTimePeriod('month')}>1M</button>
            </div>
          </div>
          <div className="kpi-value">
            {loading ? '...' : `₵${getRevenue().toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </div>
          <div className={`kpi-trend ${getTransactionCount() > 0 ? 'positive' : ''}`}>
            {!loading && (
              <>
                <ArrowUpSquare set="bulk" size={14} primaryColor="currentColor" />
                {getTransactionCount()} transactions
              </>
            )}
          </div>
        </div>

        {/* Inventory Value KPI */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Inventory Value</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wallet set="bulk" size={16} primaryColor="var(--secondary)" />
            </div>
          </div>
          <div className="kpi-value">
            {loading ? '...' : `₵${(inventoryStatus.total_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </div>
          <div className="kpi-trend" style={{ color: 'var(--text-muted)' }}>
            {!loading && (
              <>
                <Document set="bulk" size={14} primaryColor="currentColor" />
                {inventoryStatus.total_products || 0} products tracked
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stock Alert Banner */}
      {!loading && (inventoryStatus.low_stock_count || 0) > 0 && (
        <div className="stock-alert-banner">
          <Danger set="bulk" size={18} primaryColor="var(--warning)" />
          <span className="alert-text">
            <strong>{inventoryStatus.low_stock_count}</strong> products are below critical stock levels
          </span>
          <Link to="/inventory" className="alert-action">
            Restock →
          </Link>
        </div>
      )}

      {/* Tables Row */}
      <div className="dashboard-tables-grid">
        {/* Product Performance */}
        <div className="dashboard-table-card">
          <div className="table-card-header">
            <h3>
              <Graph set="bulk" size={16} primaryColor="var(--primary)" />
              Product Performance
            </h3>
            <span className="subtitle">Revenue Leaders</span>
          </div>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Name</th>
                <th style={{ textAlign: 'center' }}>Qty Sold</th>
                <th style={{ textAlign: 'right' }}>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Loading...</td></tr>
              ) : topProducts.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>No sales data yet</td></tr>
              ) : (
                topProducts.slice(0, 5).map((product, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{product.product_name}</td>
                    <td style={{ textAlign: 'center' }}>{product.total_sold}</td>
                    <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 700 }}>
                      ₵{Number(product.total_revenue || product.total_sold * 10).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Cashier Sales Report */}
        <div className="dashboard-table-card">
          <div className="table-card-header">
            <h3>
              <User set="bulk" size={16} primaryColor="var(--accent)" />
              Cashier Sales Report
            </h3>
            <span className="subtitle">Cashier Performance</span>
          </div>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Name</th>
                <th style={{ textAlign: 'center' }}>Transactions</th>
                <th style={{ textAlign: 'right' }}>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Loading...</td></tr>
              ) : cashierPerformance.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>No sales data yet</td></tr>
              ) : (
                cashierPerformance.map((cashier, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{cashier.cashier_name}</td>
                    <td style={{ textAlign: 'center' }}>{cashier.transaction_count} sales</td>
                    <td style={{ textAlign: 'right', color: 'var(--primary)', fontWeight: 700 }}>
                      ₵{Number(cashier.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions History */}
      <div className="dashboard-table-card" style={{ marginTop: '1.5rem', gridColumn: 'span 12' }}>
        <div className="table-card-header">
          <h3>Recent Transactions History</h3>
          <Link to="/sales" className="subtitle" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Go to Checkout →</Link>
        </div>
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
              {recentSales.length === 0 && (
                 <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>No recent activity.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
