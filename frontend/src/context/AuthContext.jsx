import React, { createContext, useContext, useState } from 'react';

/**
 * Authentication Context Stub
 * Will be fully implemented during Auth milestone.
 */
export const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {
    throw new Error('login is not implemented yet');
  },
  logout: async () => {
    throw new Error('logout is not implemented yet');
  },
  refresh: async () => {
    throw new Error('refresh is not implemented yet');
  },
});

export function AuthProvider({ children }) {
  const [user] = useState(null);
  const [loading] = useState(false);

  const value = {
    user,
    loading,
    login: async () => {
      throw new Error('login is not implemented yet');
    },
    logout: async () => {
      throw new Error('logout is not implemented yet');
    },
    refresh: async () => {
      throw new Error('refresh is not implemented yet');
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
