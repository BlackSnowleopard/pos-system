import React, { useState, useContext } from 'react';
import { AuthContext } from '../commons/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../assets/css/styles.css'; // Global CSS

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
        navigate('/dashboard'); // Redirect to dashboard on success
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
    <div className="login-container">
      <div className="login-card">
        <h2>POS System Login</h2>
        <div style={{display: 'flex', gap: '8px', marginBottom: '1.5rem', justifyContent: 'center'}}>
          <button type="button" onClick={() => autofill('admin@pos.com', 'admin123')} style={{fontSize: '0.8rem', padding: '0.4rem 0.8rem', cursor: 'pointer'}}>Admin</button>
          <button type="button" onClick={() => autofill('manager@pos.com', 'password123')} style={{fontSize: '0.8rem', padding: '0.4rem 0.8rem', cursor: 'pointer'}}>Manager</button>
          <button type="button" onClick={() => autofill('cashier@pos.com', 'password123')} style={{fontSize: '0.8rem', padding: '0.4rem 0.8rem', cursor: 'pointer'}}>Cashier</button>
        </div>
        
        {errorMsg && <div className="error-message">{errorMsg}</div>}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
