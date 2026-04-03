import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../commons/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { 
  Home, 
  Buy, 
  Category, 
  User, 
  Graph, 
  Document, 
  Logout,
  Setting
} from 'react-iconly';

const MainLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home set="bulk" primaryColor="currentColor" size={20} />, roles: ['Administrator', 'Manager', 'Cashier'] },
    { name: 'Sales Terminal', path: '/sales', icon: <Buy set="bulk" primaryColor="currentColor" size={20} />, roles: ['Administrator', 'Manager', 'Cashier'] },
    { name: 'Products Catalog', path: '/products', icon: <Category set="bulk" primaryColor="currentColor" size={20} />, roles: ['Administrator', 'Manager', 'Cashier'] },
    { name: 'Customers', path: '/customers', icon: <User set="bulk" primaryColor="currentColor" size={20} />, roles: ['Administrator', 'Manager', 'Cashier'] },
    { name: 'Reports', path: '/reports', icon: <Graph set="bulk" primaryColor="currentColor" size={20} />, roles: ['Administrator', 'Manager'] },
    { name: 'Inventory', path: '/inventory', icon: <Document set="bulk" primaryColor="currentColor" size={20} />, roles: ['Administrator', 'Manager'] },
  ];

  const filteredLinks = navLinks.filter(link => link.roles.includes(user?.role));

  return (
    <div className="app-wrapper">
      <aside className="sidebar glass">
        <div className="sidebar-logo">
          <div className="logo-symbol">P</div>
          <span>POS PRO</span>
        </div>
        
        <nav className="nav-links">
          {filteredLinks.map((link) => (
            <li key={link.path} className="nav-item">
              <Link 
                to={link.path} 
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.icon}
                <span className="nav-text">{link.name}</span>
              </Link>
            </li>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* Theme Toggle (HCI: User Control & Freedom) */}
          <div className="theme-toggle-wrapper nav-item">
            <button onClick={toggleTheme} className="nav-link theme-btn" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <Setting set="bulk" primaryColor="currentColor" size={20} />
                 <span className="nav-text">Theme</span>
              </div>
              <div className={`toggle-switch ${theme}`}>
                <div className="toggle-knob"></div>
              </div>
            </button>
          </div>

          <div className="nav-item">
            <button onClick={handleLogout} className="nav-link logout-btn" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
              <Logout set="bulk" primaryColor="currentColor" size={20} />
              <span className="nav-text">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header glass">
          <div className="header-breadcrumbs">
            <h2>{location.pathname.substring(1) || 'Dashboard'}</h2>
          </div>
          
          <div className="user-snippet pro-card glass">
            <div className="user-avatar">{user?.name?.charAt(0)}</div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
        </header>

        <div className="page-body fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
