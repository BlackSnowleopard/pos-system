import React, { useContext } from 'react';
import { AuthContext } from '../commons/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/styles.css';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-nav">
            <h1>POS Dashboard</h1>
            <nav className="top-nav">
                <Link to="/dashboard" className="active">Dashboard</Link>
                <Link to="/sales">Sales</Link>
                <Link to="/products">Products</Link>
                <Link to="/inventory">Inventory</Link>
            </nav>
        </div>
        <div className="user-info">
          <span>{user?.name} ({user?.role})</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>
      <main className="dashboard-content">
        <p>This is the protected dashboard. Add Module 2 (Product Management) features here.</p>
        
        {user?.role === 'Administrator' && (
          <div className="admin-panel">
            <h3>Admin Actions</h3>
            <p>Only visible to Administrators.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
