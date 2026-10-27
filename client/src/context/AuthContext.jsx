import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tiffinloop_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('tiffinloop_user');
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('tiffinloop_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Verify auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('tiffinloop_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('tiffinloop_token', newToken);
        localStorage.setItem('tiffinloop_user', JSON.stringify(newUser));
        toast.success(`Welcome back, ${newUser.name}!`);
        return newUser;
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('tiffinloop_token', newToken);
        localStorage.setItem('tiffinloop_user', JSON.stringify(newUser));
        toast.success(`Account created! Welcome, ${newUser.name}`);
        return newUser;
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      throw err;
    }
  };

  const quickLoginAs = async (role) => {
    const credentials = {
      customer: { email: 'customer@demo.com', password: 'Demo@1234' },
      provider: { email: 'provider@demo.com', password: 'Demo@1234' },
      delivery: { email: 'delivery@demo.com', password: 'Demo@1234' },
    };

    const target = credentials[role];
    if (!target) return;

    return await login(target.email, target.password);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('tiffinloop_token');
    localStorage.removeItem('tiffinloop_user');
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        quickLoginAs,
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
