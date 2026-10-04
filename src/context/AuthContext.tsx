import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (loginId: string, pass: string) => Promise<void>;
  signup: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    avatar?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (updatedFields: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'hypchat_auth_user';
const STORAGE_KEY_TOKEN = 'hypchat_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // If no user is logged in, optionally provide quick demo login if desired,
    // or keep user on Auth screen. Let's finish initialization.
    setIsLoading(false);
  }, []);

  const login = async (loginId: string, pass: string) => {
    const res = await api.login(loginId, pass);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user));
    localStorage.setItem(STORAGE_KEY_TOKEN, res.token);
  };

  const signup = async (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    avatar?: string;
  }) => {
    const res = await api.signup(data);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user));
    localStorage.setItem(STORAGE_KEY_TOKEN, res.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const fresh = await api.getUser(user.username);
      setUser(fresh);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(fresh));
    } catch {
      // Keep existing user if network fails
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    await api.deleteAccount(user.id);
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        refreshUser,
        deleteAccount
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
