import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { tokenStore } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(tokenStore.user);
  const [booting, setBooting] = useState(Boolean(tokenStore.token));

  useEffect(() => {
    let active = true;
    const validate = async () => {
      if (!tokenStore.token) {
        setBooting(false);
        return;
      }
      try {
        const response = await adminApi.me();
        const currentUser = response?.data?.user || response?.data;
        if (currentUser?.role !== 'admin') throw new Error('Only admin users can access this panel.');
        if (active) {
          tokenStore.user = currentUser;
          setUser(currentUser);
        }
      } catch {
        tokenStore.clear();
        if (active) setUser(null);
      } finally {
        if (active) setBooting(false);
      }
    };
    validate();
    return () => {
      active = false;
    };
  }, []);

  const login = async ({ email, password, rememberMe }) => {
    const response = await adminApi.login({ email, password, rememberMe });
    const payload = response?.data || {};
    const currentUser = payload.user;
    if (currentUser?.role !== 'admin') {
      tokenStore.clear();
      throw new Error('This account is not an admin. Please login with an admin account.');
    }
    tokenStore.token = payload.accessToken;
    tokenStore.refreshToken = payload.refreshToken;
    tokenStore.user = currentUser;
    setUser(currentUser);
    return currentUser;
  };

  const logout = async () => {
    try {
      await adminApi.logout(tokenStore.refreshToken);
    } catch {
      // Token may be expired or backend may not have cookie-parser enabled. Always clear local state.
    }
    tokenStore.clear();
    setUser(null);
  };

  const value = useMemo(() => ({ user, booting, login, logout, isAuthenticated: Boolean(user && tokenStore.token) }), [user, booting]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
