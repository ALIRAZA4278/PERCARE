'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('petcare-auth');
    if (saved === 'true') setIsLoggedIn(true);
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem('petcare-auth', 'true');
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('petcare-auth');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
