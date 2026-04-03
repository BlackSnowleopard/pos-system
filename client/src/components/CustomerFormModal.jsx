import React, { useState, useEffect } from 'react';
import { User, Call, Message, Location, CloseSquare, ShieldDone } from 'react-iconly';

const CustomerFormModal = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const token = localStorage.getItem('posToken');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || ''
      });
    } else {
      setFormData({ name: '', phone: '', email: '', address: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const method = initialData ? 'PUT' : 'POST';
    const url = initialData 
      ? `http://localhost:5000/api/customers/${initialData.customer_id}` 
      : 'http://localhost:5000/api/customers';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess(initialData ? 'update' : 'add');
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('Internal Server Error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-pro glass fade-in" style={{ maxWidth: '480px' }}>
        <button 
           onClick={onClose} 
           style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
        >
          <CloseSquare set="bulk" size={20} />
        </button>

        <h2 style={{ marginBottom: '2rem' }}>
          <User set="bulk" primaryColor="var(--primary)" size={24} /> 
          {initialData ? 'Update Customer Profile' : 'New Member Registration'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
               <User set="bulk" size={14} /> Full Name <span className="required">*</span>
            </label>
            <input 
              type="text" 
              name="name" 
              className="input-field"
              placeholder="e.g. John Doe"
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="col">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                   <Call set="bulk" size={14} /> Phone Number
                </label>
                <input 
                  type="text" 
                  name="phone" 
                  className="input-field"
                  placeholder="+251..."
                  value={formData.phone} 
                  onChange={handleChange} 
                />
            </div>
            <div className="col">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                   <Message set="bulk" size={14} /> Email Address
                </label>
                <input 
                  type="email" 
                  name="email" 
                  className="input-field"
                  placeholder="john@example.com"
                  value={formData.email} 
                  onChange={handleChange} 
                />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Location set="bulk" size={14} /> Physical Address
            </label>
            <textarea 
              name="address" 
              className="input-field"
              style={{ minHeight: '80px', paddingTop: '10px' }}
              placeholder="Enter street address, city..."
              value={formData.address} 
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="modal-actions" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ minWidth: '160px', justifyContent: 'center' }}>
                <ShieldDone set="bulk" size={18} /> {initialData ? 'Update Member' : 'Create Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;
