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
    const init = async ()=>{
      const token = localStorage.getItem('token');
      if (!token) return;
      API.setAuthToken(token);
      try{
        const res = await API.get('/auth/me');
        const userObj = res.data.user;
        if (userObj) {
          localStorage.setItem('user', JSON.stringify(userObj));
          setUser(userObj);
        }
      }catch(err){
        // token invalid or server error; clear stored auth
        console.warn('Failed to validate token with /auth/me', err?.response?.data || err.message);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        API.setAuthToken(null);
        setUser(null);
      }
    };
    init();
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
