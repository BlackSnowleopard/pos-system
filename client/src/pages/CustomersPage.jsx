import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../commons/AuthContext';
import CustomerFormModal from '../components/CustomerFormModal';
import CustomerHistoryModal from '../components/CustomerHistoryModal';
import { Search, User, TimeCircle, Edit, Delete, ShieldDone, Message, Call } from 'react-iconly';

const CustomersPage = () => {
  const { user } = useContext(AuthContext);
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
    fetchCustomers();
  };

  return (
    <div className="customers-view fade-in">
      <div className="toolbar glass" style={{ padding: '1rem', marginBottom: '2rem' }}>
        <div className="search-bar" style={{ flex: 1, position: 'relative' }}>
          <Search set="light" size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            className="input-field"
            style={{ paddingLeft: '40px', background: 'rgba(0,0,0,0.4)', width: '100%' }}
            placeholder="Search by name, phone, or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          <User set="bulk" primaryColor="currentColor" size={20} /> New Customer
        </button>
      </div>

      <div className="data-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Contact Info</th>
              <th>Loyalty Status</th>
              <th>Member Since</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No customers found in database.</td></tr>
            ) : (
              customers.map((c) => (
                <tr key={c.customer_id}>
                  <td>#{c.customer_id}</td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{c.name}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       {c.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}><Call set="bulk" size={12} /> {c.phone}</div>}
                       {c.email && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}><Message set="bulk" size={12} /> {c.email}</div>}
                       {!c.phone && !c.email && <span style={{ color: 'var(--text-dim)' }}>-</span>}
                    </div>
                  </td>
                  <td>
                    <div className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldDone set="bulk" size={14} /> {c.loyalty_points} Points
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                    {new Date(c.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }} onClick={() => openHistoryModal(c)}>
                        <TimeCircle set="bulk" size={14} style={{ marginRight: '4px' }} /> History
                      </button>
                      <button className="btn-secondary" style={{ padding: '8px' }} onClick={() => openEditModal(c)}>
                        <Edit set="bulk" size={14} />
                      </button>
                      {(user?.role === 'Administrator' || user?.role === 'Manager') && (
                        <button className="btn-secondary" style={{ padding: '8px', color: 'var(--error)' }} onClick={() => handleDelete(c.customer_id)}>
                          <Delete set="bulk" size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
