import React, { useState, useEffect } from 'react';
import { Category, CloseSquare, Wallet, Scan, MoreSquare, Danger } from 'react-iconly';

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    category: '',
    price: '',
    quantity: '',
    low_stock_threshold: '10',
    barcode: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        product_name: initialData.product_name || '',
        category: initialData.category || '',
        price: initialData.price || '',
        quantity: initialData.quantity !== null ? initialData.quantity : '',
        low_stock_threshold: initialData.low_stock_threshold !== null ? initialData.low_stock_threshold : '10',
        barcode: initialData.barcode || ''
      });
    } else {
      setFormData({
        product_name: '',
        category: '',
        price: '',
        quantity: '',
        low_stock_threshold: '10',
        barcode: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-pro glass fade-in">
        <button 
           onClick={onClose} 
           style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
        >
          <CloseSquare set="bulk" size={20} />
        </button>
        
        <h2 style={{ marginBottom: '2rem' }}>
          <Category set="bulk" primaryColor="var(--primary)" size={24} /> 
          {initialData ? 'Update Catalog Item' : 'New Product Entry'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
               <MoreSquare set="bulk" size={14} /> Product Name <span className="required">*</span>
            </label>
            <input 
              type="text" 
              name="product_name" 
              className="input-field"
              placeholder="e.g. Premium Coffee Beans"
              value={formData.product_name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="col">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Category set="bulk" size={14} /> Category
                </label>
                <input type="text" name="category" placeholder="Drinks" className="input-field" value={formData.category} onChange={handleChange} />
            </div>
            <div className="col">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Scan set="bulk" size={14} /> Barcode
                </label>
                <input type="text" name="barcode" placeholder="UPC-A / EAN" className="input-field" value={formData.barcode} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="col">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Wallet set="bulk" size={14} /> Default Price <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                 <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>$</span>
                 <input type="number" step="0.01" name="price" className="input-field" style={{ paddingLeft: '22px' }} value={formData.price} onChange={handleChange} required />
              </div>
            </div>
            <div className="col">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <MoreSquare set="bulk" size={14} /> Initial Qty
              </label>
              <input type="number" name="quantity" className="input-field" value={formData.quantity} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Danger set="bulk" size={14} primaryColor="var(--warning)" /> Low Stock Warning Level
            </label>
            <input type="number" name="low_stock_threshold" className="input-field" value={formData.low_stock_threshold} onChange={handleChange} />
          </div>

          <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ minWidth: '140px', justifyContent: 'center' }}>
              {initialData ? 'Update Product' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
