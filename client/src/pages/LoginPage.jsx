import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../commons/AuthContext';
import { User, Lock, Home, ShieldDone } from 'react-iconly';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        navigate('/dashboard'); 
      } else {
        setErrorMsg(data.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Cannot connect to server');
    }
  };

  const autofill = (roleEmail, rolePassword) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
  };

  return (
    <div className="login-page">
      <div className="login-card-pro glass fade-in">
        <div className="login-logo">
           <div style={{ background: 'var(--primary-glow)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Home set="bulk" size={32} primaryColor="var(--primary)" />
           </div>
           <h1 className="login-title">POS PRO</h1>
           <p className="login-subtitle">Advanced Point of Sale Terminal</p>
        </div>
        
        {errorMsg && (
          <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <ShieldDone set="bulk" size={16} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-muted)' }}>
               <User set="bulk" size={16} /> Email Address
            </label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-muted)' }}>
               <Lock set="bulk" size={16} /> Password
            </label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
            Sign In to Terminal
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Access Demo Accounts
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button type="button" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => autofill('admin@pos.com', 'admin123')}>Admin</button>
            <button type="button" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => autofill('manager@pos.com', 'password123')}>Manager</button>
            <button type="button" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => autofill('cashier@pos.com', 'password123')}>Cashier</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
