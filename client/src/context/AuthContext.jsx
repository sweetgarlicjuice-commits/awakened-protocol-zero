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
      // FIX: Check hasCharacter OR character object
      if (data.hasCharacter || data.character) {
        setCharacter(data.character);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('apz_token');
      localStorage.removeItem('apz_user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setError(null);
    setLoading(true);
    
    try {
      const { data } = await authAPI.login(username, password);
      
      // Store token first
      localStorage.setItem('apz_token', data.token);
      localStorage.setItem('apz_user', JSON.stringify(data.user));
      
      // Set user state
      setUser(data.user);
      
      // FIX #1: Fetch character data BEFORE returning
      // This ensures character state is set before navigation happens
      let characterData = null;
      let hasChar = data.hasCharacter;
      
      if (data.hasCharacter) {
        try {
          const charResponse = await characterAPI.get();
          characterData = charResponse.data.character;
          setCharacter(characterData);
          hasChar = !!characterData;
        } catch (charErr) {
          console.error('Failed to fetch character:', charErr);
          // If fetch fails, character might not exist
          hasChar = false;
        }
      } else {
        setCharacter(null);
      }
      
      setLoading(false);
      
      // Return with accurate hasCharacter status
      return { 
        success: true, 
        hasCharacter: hasChar,
        isGM: data.user?.role === 'gm' || data.user?.role === 'admin',
        user: data.user
      };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      setLoading(false);
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
      return { success: true, character: data.character };
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
