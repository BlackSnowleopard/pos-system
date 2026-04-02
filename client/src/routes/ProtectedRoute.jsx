import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../commons/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // Could be a spinner component
  }

  if (!user) {
    // User is not logged in, redirect to login
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User role is not authorized for this route
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
