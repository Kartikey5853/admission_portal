import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = () => {
  const { auth } = useAuth();

  // If auth is missing OR the user is not a student
  if (!auth || auth.user.role !== 'student') {
    return <Navigate to="/login" replace />;
  }

  // If auth is valid, render the nested child route (e.g., Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;