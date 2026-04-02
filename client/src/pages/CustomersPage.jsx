import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../commons/AuthContext';
import { Link } from 'react-router-dom';
import CustomerFormModal from '../components/CustomerFormModal';
import CustomerHistoryModal from '../components/CustomerHistoryModal';
import '../assets/css/styles.css';

const CustomersPage = () => {
  const { user, logout } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // History Modal State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  const token = localStorage.getItem('posToken');

  const fetchCustomers = async () => {
    try {
      const url = searchQuery 
        ? `http://localhost:5000/api/customers?search=${encodeURIComponent(searchQuery)}`
        : 'http://localhost:5000/api/customers';

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setCustomers(await response.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line
  }, [searchQuery]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer? Their past sales will remain but be un-linked.")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchCustomers();
      } else {
        alert('Failed to delete. Make sure you are an Administrator or Manager.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const openHistoryModal = (customer) => {
    setViewingCustomer(customer);
    setIsHistoryOpen(true);
  };

  const handleModalSuccess = () => {
    fetchCustomers(); // Refresh the table
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-nav">
            <h1>Customer Management</h1>
            <nav className="top-nav">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/sales">Sales</Link>
                <Link to="/products">Products</Link>
                <Link to="/customers" className="active">Customers</Link>
                {(user?.role === 'Administrator' || user?.role === 'Manager') && (
                  <Link to="/inventory">Inventory</Link>
                )}
            </nav>
        </div>
        <div className="user-info">
          <span>{user?.name} ({user?.role})</span>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="action-bar">
          <input 
            type="text" 
            placeholder="Search customes by name or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="btn-primary" onClick={openAddModal}>+ New Customer</button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Loyalty Points</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.customer_id}>
                  <td>{c.customer_id}</td>
                  <td style={{ fontWeight: 'bold' }}>{c.name}</td>
                  <td>{c.phone || '-'}</td>
                  <td>{c.email || '-'}</td>
                  <td>
                    <span style={{ 
                      background: '#ebf8ff', color: '#2b6cb0', 
                      padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' 
                    }}>
                      {c.loyalty_points} pts
                    </span>
                  </td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button className="btn-secondary" onClick={() => openHistoryModal(c)} style={{ marginRight: '8px' }}>
                      View History
                    </button>
                    <button className="btn-edit" onClick={() => openEditModal(c)}>Edit</button>
                    {(user?.role === 'Administrator' || user?.role === 'Manager') && (
                      <button className="btn-delete" onClick={() => handleDelete(c.customer_id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && <p style={{ textAlign: 'center', marginTop: '2rem' }}>No customers found.</p>}
        </div>
      </main>

      <CustomerFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        initialData={editingCustomer}
      />

      <CustomerHistoryModal 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        customer={viewingCustomer}
      />
    </div>
  );
};

export default CustomersPage;
