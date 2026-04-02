import React, { useState, useEffect } from 'react';

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    category: '',
    price: '',
    quantity: '',
    low_stock_threshold: '10',
    barcode: ''
  });

  // Populate form when editing
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
      <div className="modal-content">
        <h2>{initialData ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Product Name <span className="required">*</span></label>
            <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} />
          </div>
          <div className="form-group row">
            <div className="col">
              <label>Price ($) <span className="required">*</span></label>
              <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="col">
              <label>Barcode</label>
              <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group row">
            <div className="col">
              <label>Quantity</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} />
            </div>
            <div className="col">
              <label>Low Stock Threshold</label>
              <input type="number" name="low_stock_threshold" value={formData.low_stock_threshold} onChange={handleChange} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">{initialData ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
