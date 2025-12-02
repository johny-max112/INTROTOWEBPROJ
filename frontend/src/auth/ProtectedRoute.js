import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from './AuthContext';

export default function ProtectedRoute({ children }){
  const { user } = useContext(AuthContext);
  // If user hasn't been populated yet but a token exists in localStorage,
  // show a short loading placeholder instead of redirecting to login.
  if (!user) {
    const token = localStorage.getItem('token');
    if (token) return <div>Loading...</div>;
    return <Navigate to="/login" replace />;
  }
  return children;
}
