import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../commons/AuthContext';
import { 
  Buy, 
  Category, 
  User, 
  Graph, 
  ShieldDone 
} from 'react-iconly';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="dashboard-view fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p style={{ color: 'var(--text-muted)' }}>Here's what's happening at the terminal today.</p>
      </div>

      <div className="analytics-details" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Quick Action Cards */}
        <Link to="/sales" className="pro-card hover-glow" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'var(--primary-glow)', padding: '15px', borderRadius: '12px' }}>
            <Buy set="bulk" primaryColor="var(--primary)" size={28} />
          </div>
          <div>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '4px' }}>Launch Terminal</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Start a new sales transaction</p>
          </div>
        </Link>

        <Link to="/products" className="pro-card hover-glow" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(129, 140, 248, 0.15)', padding: '15px', borderRadius: '12px' }}>
            <Category set="bulk" primaryColor="var(--secondary)" size={28} />
          </div>
          <div>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '4px' }}>Manage Catalog</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Browse and edit your products</p>
          </div>
        </Link>

        <Link to="/customers" className="pro-card hover-glow" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(244, 114, 182, 0.15)', padding: '15px', borderRadius: '12px' }}>
            <User set="bulk" primaryColor="var(--accent)" size={28} />
          </div>
          <div>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '4px' }}>Customers</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Track loyalty and history</p>
          </div>
        </Link>
      </div>

      {(user?.role === 'Administrator' || user?.role === 'Manager') && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <ShieldDone set="bulk" primaryColor="var(--warning)" size={24} /> Management Insights
          </h2>
          <div className="analytics-details">
            <Link to="/reports" className="pro-card glass" style={{ textDecoration: 'none' }}>
              <Graph set="bulk" primaryColor="var(--success)" size={32} style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-main)' }}>View Performance Reports</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Analyze revenue trends and cashier performance.</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
