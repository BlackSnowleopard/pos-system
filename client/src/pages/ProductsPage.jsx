import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../commons/AuthContext';
import ProductFormModal from '../components/ProductFormModal';
import { Link } from 'react-router-dom';
import '../assets/css/styles.css';

const ProductsPage = () => {
  const { user, logout } = useContext(AuthContext);
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
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-nav">
            <h1>POS Products</h1>
            <nav className="top-nav">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/sales">Sales</Link>
                <Link to="/products" className="active">Products</Link>
                <Link to="/customers">Customers</Link>
                <Link to="/inventory">Inventory</Link>
            </nav>
        </div>
        <div className="user-info">
          <span>{user?.name} ({user?.role})</span>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="toolbar">
          <form className="search-bar" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Search by name or barcode..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn-secondary">Search</button>
            {searchQuery && <button type="button" className="btn-text" onClick={() => {setSearchQuery(''); fetchProducts('');}}>Clear</button>}
          </form>

          {canModify && (
            <button className="btn-primary" onClick={handleAddClick}>+ Add New Product</button>
          )}
        </div>

        {errorMsg && <div className="error-message">{errorMsg}</div>}

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Barcode</th>
                {canModify && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={canModify ? 7 : 6} className="text-center">No products found.</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.product_id} className={product.quantity <= (product.low_stock_threshold || 10) ? 'row-warning' : ''}>
                    <td>{product.product_id}</td>
                    <td>{product.product_name}</td>
                    <td>{product.category || '-'}</td>
                    <td>${Number(product.price).toFixed(2)}</td>
                    <td>
                        <span className={`badge ${product.quantity <= (product.low_stock_threshold || 10) ? 'badge-danger' : 'badge-success'}`}>
                            {product.quantity}
                        </span>
                    </td>
                    <td>{product.barcode || '-'}</td>
                    {canModify && (
                      <td className="actions-cell">
                        <button className="btn-icon" title="Edit" onClick={() => handleEditClick(product)}>✏️</button>
                        <button className="btn-icon delete" title="Delete" onClick={() => handleDelete(product.product_id)}>🗑️</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

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
