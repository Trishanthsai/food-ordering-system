// src/context/AuthContext.js
// Provides authentication state and helpers across the entire app

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore auth from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const name  = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const role  = localStorage.getItem('role');
    if (token && name && email && role) {
      setUser({ token, name, email, role });
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('name',  data.name);
    localStorage.setItem('email', data.email);
    localStorage.setItem('role',  data.role);
    setUser(data);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isUser  = () => user?.role === 'USER';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
