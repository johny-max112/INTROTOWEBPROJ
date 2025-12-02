import React, { createContext, useEffect, useState } from 'react';
import API from '../api';

const AuthContext = createContext();

function getUserFromLocal() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const userJson = localStorage.getItem('user');
    if (userJson) return JSON.parse(userJson);
    return null;
  } catch (err) {
    return null;
  }
}

export function AuthProvider({ children }){
  const [user, setUser] = useState(getUserFromLocal());

  useEffect(()=>{
    const token = localStorage.getItem('token');
    if (token) API.setAuthToken(token);
  }, []);

  const login = (token, userObj) =>{
    localStorage.setItem('token', token);
    if (userObj) localStorage.setItem('user', JSON.stringify(userObj));
    API.setAuthToken(token);
    setUser(userObj || null);
  };

  const logout = ()=>{
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    API.setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
