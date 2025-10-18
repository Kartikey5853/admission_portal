import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const AdminProtectedRoute = () => {
  const { auth } = useAuth();

  // If auth is missing OR the user is a student
  if (!auth || auth.user.role === 'student') {
    return <Navigate to="/admin/login" replace />;
  }

  // If auth is valid, render the child route (e.g., AdminDashboard)
  return <Outlet />;
};

export default AdminProtectedRoute;