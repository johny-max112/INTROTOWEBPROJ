import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from './AuthContext';

export default function AdminRoute({ children }){
  const { user } = useContext(AuthContext);
  // If user isn't ready but a token exists, show a brief loading state
  // to avoid bouncing back to login during the login redirect flow.
  if (!user) {
    const token = localStorage.getItem('token');
    if (token) return <div>Loading...</div>;
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
