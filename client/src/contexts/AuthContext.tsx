"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { zkLoginService, ZkLoginAccount } from '@/services/zklogin-service';

interface AuthContextType {
  account: ZkLoginAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (provider: 'google') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<ZkLoginAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication on mount
    const currentAccount = zkLoginService.getCurrentAccount();
    setAccount(currentAccount);
    setIsLoading(false);
  }, []);

  const login = async (provider: 'google') => {
    try {
      await zkLoginService.startLoginFlow(provider);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    zkLoginService.logout();
    setAccount(null);
  };

  const value: AuthContextType = {
    account,
    isAuthenticated: account !== null,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
