import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smart_inventory_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smart_inventory_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && !user) {
      authApi.getMe()
        .then((res) => {
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('smart_inventory_user', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    if (res.success && res.data) {
      const authData = res.data;
      setToken(authData.accessToken);
      localStorage.setItem('smart_inventory_token', authData.accessToken);

      const userInfo = {
        id: authData.userId,
        username: authData.username,
        email: authData.email,
        fullName: authData.fullName,
        roles: authData.roles,
      };
      setUser(userInfo);
      localStorage.setItem('smart_inventory_user', JSON.stringify(userInfo));
      return userInfo;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('smart_inventory_token');
    localStorage.removeItem('smart_inventory_user');
    setToken(null);
    setUser(null);
  };

  const roles = user?.roles || [];
  const isAdmin = roles.includes('ROLE_ADMIN');
  const isManager = roles.includes('ROLE_INVENTORY_MANAGER') || isAdmin;
  const isStaff = roles.includes('ROLE_STAFF') || isManager;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token,
        isAdmin,
        isManager,
        isStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
