import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, characterAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('apz_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
      if (data.character) {
        setCharacter(data.character);
      }
    } catch (err) {
      localStorage.removeItem('apz_token');
      localStorage.removeItem('apz_user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setError(null);
    try {
      const { data } = await authAPI.login(username, password);
      localStorage.setItem('apz_token', data.token);
      localStorage.setItem('apz_user', JSON.stringify(data.user));
      setUser(data.user);
      
      // Fetch character if exists
      if (data.hasCharacter) {
        const charResponse = await characterAPI.get();
        setCharacter(charResponse.data.character);
      }
      
      return { success: true, hasCharacter: data.hasCharacter };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('apz_token');
    localStorage.removeItem('apz_user');
    setUser(null);
    setCharacter(null);
  };

  const createCharacter = async (name, baseClass) => {
    try {
      const { data } = await characterAPI.create(name, baseClass);
      setCharacter(data.character);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to create character' };
    }
  };

  const refreshCharacter = async () => {
    try {
      const { data } = await characterAPI.get();
      setCharacter(data.character);
      return data.character;
    } catch (err) {
      console.error('Failed to refresh character:', err);
      return null;
    }
  };

  // Update character locally without API call (for real-time UI updates)
  const updateLocalCharacter = (updates) => {
    setCharacter(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      
      // Handle nested stats object
      if (updates.stats) {
        updated.stats = { ...prev.stats, ...updates.stats };
      }
      
      // Handle other top-level properties
      Object.keys(updates).forEach(key => {
        if (key !== 'stats') {
          updated[key] = updates[key];
        }
      });
      
      return updated;
    });
  };

  const isGM = user?.role === 'gm' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    character,
    loading,
    error,
    login,
    logout,
    createCharacter,
    refreshCharacter,
    updateLocalCharacter,
    isGM,
    isAdmin,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
