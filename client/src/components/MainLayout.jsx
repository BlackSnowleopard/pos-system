import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../commons/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { 
  Home, 
  Buy, 
  User, 
  Document, 
  Logout,
  Search,
  ChevronRight,
  Category,
  Setting,
  CloseSquare
} from 'react-iconly';
import { Sun, Moon } from 'lucide-react';

const HamburgerIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const MainLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  const [inventoryOpen, setInventoryOpen] = useState(() => {
    return location.pathname === '/inventory' || location.pathname === '/products';
  });

  const handleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sidebarCollapsed', String(next));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showInventory = user?.role === 'Administrator' || user?.role === 'Manager';

  // Page title mapping
  const pageTitles = {
    '/dashboard': 'Dashboard & Analytics',
    '/sales': 'Checkout',
    '/products': 'Product Catalog',
    '/customers': 'Customers',
    '/inventory': 'Stock Adjustments',
  };

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className={`app-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        
        {/* Toggle Button at the top */}
        <div style={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-end', padding: isCollapsed ? '20px 0 10px 0' : '20px 20px 10px 0' }}>
          <button 
            onClick={handleCollapse} 
            title={isCollapsed ? 'Expand Menu' : 'Close Menu'}
            style={{ 
               background: 'none', 
               border: 'none', 
               color: 'var(--text-dim)', 
               cursor: 'pointer',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               width: '40px',
               height: '40px',
               borderRadius: '8px',
               transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
          >
            {isCollapsed ? <HamburgerIcon size={24} /> : <CloseSquare set="light" size={24} />}
          </button>
        </div>

        {/* User Profile */}
        <div className="sidebar-profile" style={{ marginTop: '0', paddingTop: '10px' }}>
          <div className="user-avatar">{user?.name?.charAt(0)}</div>
          <div className="profile-info">
            <span className="profile-name">{user?.name}</span>
            <span className="profile-email">{user?.email || user?.role}</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="nav-links">
          {/* Dashboard */}
          <li className="nav-item">
            <Link 
              to="/dashboard" 
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              data-tooltip="Dashboard"
            >
              <span className="nav-icon"><Home set="bulk" primaryColor="currentColor" size={20} /></span>
              <span className="nav-text">Dashboard</span>
            </Link>
          </li>

          {/* Checkout */}
          <li className="nav-item">
            <Link 
              to="/sales" 
              className={`nav-link ${location.pathname === '/sales' ? 'active' : ''}`}
              data-tooltip="Checkout"
            >
              <span className="nav-icon"><Buy set="bulk" primaryColor="currentColor" size={20} /></span>
              <span className="nav-text">Checkout</span>
            </Link>
          </li>

          {/* Customers */}
          <li className="nav-item">
            <Link 
              to="/customers" 
              className={`nav-link ${location.pathname === '/customers' ? 'active' : ''}`}
              data-tooltip="Customers"
            >
              <span className="nav-icon"><User set="bulk" primaryColor="currentColor" size={20} /></span>
              <span className="nav-text">Customers</span>
            </Link>
          </li>

          {/* Inventory (Admin/Manager only) */}
          {showInventory && (
            <li className="nav-item">
              <div
                className={`nav-link nav-submenu-trigger ${inventoryOpen ? 'open' : ''} ${(location.pathname === '/inventory' || location.pathname === '/products') ? 'active' : ''}`}
                data-tooltip="Inventory"
                onClick={() => {
                  if (isCollapsed) {
                    navigate('/inventory');
                  } else {
                    setInventoryOpen(!inventoryOpen);
                  }
                }}
              >
                <span className="nav-icon">
                  <Document set="bulk" primaryColor="currentColor" size={20} />
                </span>
                <span className="nav-text">Inventory</span>
                <span className="submenu-chevron">
                  <ChevronRight set="light" size={14} primaryColor="currentColor" />
                </span>
              </div>
              <div className={`nav-submenu ${inventoryOpen ? 'open' : ''}`}>
                <Link 
                  to="/products" 
                  className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}
                  data-tooltip="Products"
                >
                  <span className="nav-icon" style={{ marginLeft: '10px' }}><Category set="bulk" primaryColor="currentColor" size={16} /></span>
                  <span className="nav-text">Products Catalog</span>
                </Link>
                <Link 
                  to="/inventory" 
                  className={`nav-link ${location.pathname === '/inventory' ? 'active' : ''}`}
                  data-tooltip="Adjustments"
                >
                  <span className="nav-icon" style={{ marginLeft: '10px' }}><Setting set="light" primaryColor="currentColor" size={16} /></span>
                  <span className="nav-text">Stock Adjustments</span>
                </Link>
              </div>
            </li>
          )}
        </nav>

        {/* Footer: Theme + Logout */}
        <div className="sidebar-footer">
          <div className="nav-item">
            <button onClick={toggleTheme} className="nav-link" data-tooltip="Theme" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="nav-icon">
                  {theme === 'light' ? <Sun size={20} color="currentColor" /> : <Moon size={20} color="currentColor" />}
                </span>
                <span className="nav-text">Toggle Theme</span>
              </div>
              
              {!isCollapsed && (
                <div style={{ width: '32px', height: '18px', borderRadius: '10px', background: theme === 'light' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'var(--transition)' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: theme === 'light' ? '16px' : '2px', transition: 'left 0.2s ease-out' }}></div>
                </div>
              )}
            </button>
          </div>

          <div className="nav-item">
            <button onClick={handleLogout} className="nav-link" data-tooltip="Logout" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
              <span className="nav-icon">
                <Logout set="bulk" primaryColor="currentColor" size={20} />
              </span>
              <span className="nav-text">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isCollapsed && (
              <button 
                className="collapse-toggle" 
                onClick={handleCollapse} 
                title="Expand Sidebar"
                style={{ margin: 0, display: 'none' }} // Hidden here since it's now permanently inside the sidebar
              >
                <HamburgerIcon size={16} />
              </button>
            )}
            <h2>{pageTitle}</h2>
          </div>
          
          {location.pathname === '/dashboard' && (
            <div className="header-search">
              <span className="search-icon">
                <Search set="light" size={16} primaryColor="currentColor" />
              </span>
              <input type="text" placeholder="Search analytics..." />
            </div>
          )}
        </header>

        <div className="page-body fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
