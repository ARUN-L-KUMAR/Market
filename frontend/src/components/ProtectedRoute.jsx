import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { token, user } = useSelector(state => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!token) {
      // Save current route for redirection after login
      navigate('/login', { state: { redirect: location.pathname } });
      return;
    }
    
    if (adminOnly && !user?.isAdmin && user?.role !== 'admin') {
      // Unauthorized: Not admin
      navigate('/');
      
      // Show unauthorized toast
      const event = new CustomEvent('show-toast', { 
        detail: { message: 'Access denied. Admin rights required.', type: 'error' }
      });
      window.dispatchEvent(event);
      return;
    }
  }, [token, user, adminOnly, navigate, location.pathname]);
  
  // If authorization successful, render children
  if (token && (!adminOnly || (adminOnly && (user?.isAdmin || user?.role === 'admin')))) {
    return <>{children}</>;
  }
  
  // Return empty until redirect happens
  return null;
};

export default ProtectedRoute;