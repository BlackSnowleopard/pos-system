import React, { useContext, useState } from 'react';
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
  Setting,
  Search,
  ChevronRight
} from 'react-iconly';

// Custom chevron-left icon for collapse toggle
const CollapseIcon = ({ size = 20 }) => (
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
    return location.pathname === '/inventory';
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

  const mainNavLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home set="bulk" primaryColor="currentColor" size={20} />, roles: ['Administrator', 'Manager', 'Cashier'] },
    { name: 'Checkout', path: '/sales', icon: <Buy set="bulk" primaryColor="currentColor" size={20} />, roles: ['Administrator', 'Manager', 'Cashier'] },
    { name: 'Products', path: '/products', icon: <Category set="bulk" primaryColor="currentColor" size={20} />, roles: ['Administrator', 'Manager', 'Cashier'] },
    { name: 'Customers', path: '/customers', icon: <User set="bulk" primaryColor="currentColor" size={20} />, roles: ['Administrator', 'Manager', 'Cashier'] },
    { name: 'Reports', path: '/reports', icon: <Graph set="bulk" primaryColor="currentColor" size={20} />, roles: ['Administrator', 'Manager'] },
  ];

  const filteredLinks = mainNavLinks.filter(link => link.roles.includes(user?.role));
  const showInventory = user?.role === 'Administrator' || user?.role === 'Manager';

  // Page title mapping
  const pageTitles = {
    '/dashboard': 'Overview',
    '/sales': 'Checkout',
    '/products': 'Products',
    '/customers': 'Customers',
    '/reports': 'Reports',
    '/inventory': 'Inventory',
  };

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className={`app-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* User Profile at Top */}
        <div className="sidebar-profile">
          <div className="user-avatar">{user?.name?.charAt(0)}</div>
          <div className="profile-info">
            <span className="profile-name">{user?.name}</span>
            <span className="profile-email">{user?.email || user?.role}</span>
          </div>
          <button className="collapse-toggle" onClick={handleCollapse} title={isCollapsed ? 'Expand' : 'Collapse'}>
            <CollapseIcon size={16} />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="nav-links">
          {filteredLinks.map((link) => {
            // Insert Inventory before Products
            if (link.path === '/products' && showInventory) {
              return (
                <React.Fragment key="inventory-group">
                  {/* Inventory with submenu */}
                  <li className="nav-item">
                    <div
                      className={`nav-link nav-submenu-trigger ${inventoryOpen ? 'open' : ''} ${location.pathname === '/inventory' ? 'active' : ''}`}
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
                        to="/inventory" 
                        className={`nav-link ${location.pathname === '/inventory' ? 'active' : ''}`}
                        data-tooltip="Stock Levels"
                      >
                        <span className="nav-text">Stock Levels</span>
                      </Link>
                      <Link 
                        to="/inventory" 
                        className="nav-link"
                        data-tooltip="Adjustments"
                      >
                        <span className="nav-text">Adjustments</span>
                      </Link>
                    </div>
                  </li>

                  {/* Then Products */}
                  <li key={link.path} className="nav-item">
                    <Link 
                      to={link.path} 
                      className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                      data-tooltip={link.name}
                    >
                      <span className="nav-icon">{link.icon}</span>
                      <span className="nav-text">{link.name}</span>
                    </Link>
                  </li>
                </React.Fragment>
              );
            }

            return (
              <li key={link.path} className="nav-item">
                <Link 
                  to={link.path} 
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                  data-tooltip={link.name}
                >
                  <span className="nav-icon">{link.icon}</span>
                  <span className="nav-text">{link.name}</span>
                </Link>
              </li>
            );
          })}
        </nav>

        {/* Footer: Theme + Logout */}
        <div className="sidebar-footer">
          <div className="nav-item">
            <button onClick={toggleTheme} className="nav-link" data-tooltip="Theme" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="nav-icon">
                  <Setting set="bulk" primaryColor="currentColor" size={20} />
                </span>
                <span className="nav-text">Theme</span>
              </div>
              <div className={`toggle-switch ${theme}`}>
                <div className="toggle-knob"></div>
              </div>
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
                style={{ margin: 0 }}
              >
                <CollapseIcon size={16} />
              </button>
            )}
            <h2>{pageTitle}</h2>
          </div>
          
          {(location.pathname === '/dashboard' || location.pathname === '/reports') && (
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
