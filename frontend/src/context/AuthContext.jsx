import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(authApi.getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        if (token) {
          const profile = await authApi.getMe();
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();

    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('floodwatch:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('floodwatch:unauthorized', handleUnauthorized);
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    await authApi.logout();
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
