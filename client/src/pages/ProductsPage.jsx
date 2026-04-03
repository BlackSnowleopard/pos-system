import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../commons/AuthContext';
import ProductFormModal from '../components/ProductFormModal';
import { Search, Plus, Edit, Delete, CloseSquare } from 'react-iconly';

const ProductsPage = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const token = localStorage.getItem('posToken');
  const canModify = user?.role === 'Administrator' || user?.role === 'Manager';

  const fetchProducts = async (search = '') => {
    try {
      const url = search 
        ? `http://localhost:5000/api/products?search=${encodeURIComponent(search)}`
        : 'http://localhost:5000/api/products';
        
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
        setErrorMsg('');
      } else {
        setErrorMsg(data.error || 'Failed to fetch products');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Cannot connect to server');
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(searchQuery);
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchProducts(searchQuery);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleModalSubmit = async (formData) => {
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct 
        ? `http://localhost:5000/api/products/${editingProduct.product_id}`
        : 'http://localhost:5000/api/products';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok) {
        setIsModalOpen(false);
        fetchProducts(searchQuery);
      } else {
        alert(data.error || 'Failed to save product');
      }
    } catch (error) {
      console.error(error);
      alert('Error saving product');
    }
  };

  return (
    <div className="products-view fade-in">
      <div className="toolbar glass" style={{ padding: '1rem', marginBottom: '2rem' }}>
        <form className="search-bar" onSubmit={handleSearch} style={{ flex: 1 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search set="light" size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              className="input-field"
              style={{ paddingLeft: '40px', background: 'rgba(0,0,0,0.4)' }}
              placeholder="Search by name or barcode..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <CloseSquare 
                set="bulk"
                size={16} 
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-dim)' }} 
                onClick={() => {setSearchQuery(''); fetchProducts('');}}
              />
            )}
          </div>
          <button type="submit" className="btn-secondary">Search</button>
        </form>

        {canModify && (
          <button className="btn-primary" onClick={handleAddClick}>
            <Plus set="bulk" primaryColor="currentColor" size={20} /> Add New Product
          </button>
        )}
      </div>

      {errorMsg && <div className="error-message">{errorMsg}</div>}

      <div className="data-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Barcode</th>
              {canModify && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={canModify ? 7 : 6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No products found in catalog.</td></tr>
            ) : (
              products.map((product) => (
                <tr key={product.product_id}>
                  <td>#{product.product_id}</td>
                  <td style={{ fontWeight: 600 }}>{product.product_name}</td>
                  <td><span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{product.category || 'General'}</span></td>
                  <td style={{ color: 'var(--success)', fontWeight: 700 }}>${Number(product.price).toFixed(2)}</td>
                  <td>
                      <span className={`badge ${product.quantity <= (product.low_stock_threshold || 10) ? 'badge-danger' : 'badge-success'}`}>
                          {product.quantity} in stock
                      </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>{product.barcode || '-'}</td>
                  {canModify && (
                    <td style={{ textAlign: 'right' }}>
                       <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="btn-secondary" style={{ padding: '8px' }} title="Edit" onClick={() => handleEditClick(product)}>
                            <Edit set="bulk" size={14} />
                          </button>
                          <button className="btn-secondary" style={{ padding: '8px', color: 'var(--error)' }} title="Delete" onClick={() => handleDelete(product.product_id)}>
                            <Delete set="bulk" size={14} />
                          </button>
                       </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingProduct}
      />
    </div>
  );
};

export default ProductsPage;
