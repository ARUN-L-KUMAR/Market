import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Admin from '../pages/Admin'; // Main Admin interface

/**
 * Admin routes configuration
 * All routes are protected and require admin privileges
 */
const AdminRoutes = [
  <Route 
    key="admin-dashboard" 
    path="/admin" 
    element={
      <ProtectedRoute adminOnly={true}>
        <Admin />
      </ProtectedRoute>
    } 
  />
];

export default AdminRoutes;