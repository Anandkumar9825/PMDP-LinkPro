import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ isLogin, children }) => {
  const checkAuth = () => {
    if (isLogin !== undefined && isLogin !== null) {
      return isLogin === true || isLogin === 'true';
    }
    const saved = localStorage.getItem('isLogin');
    return saved === 'true' || saved === true;
  };

  const authenticated = checkAuth();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
