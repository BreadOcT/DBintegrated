import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (newToken: string, userData: User, rememberMe?: boolean) => void;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          logout();
        } else {
          setUser(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        logout();
        setIsLoading(false);
      });
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      setUser(null);
      setIsLoading(false);
    }
  }, [token, fetchUser]);

  const login = useCallback((newToken: string, userData: User, rememberMe: boolean = false) => {
    setToken(newToken);
    setUser(userData);
    if (rememberMe) {
      localStorage.setItem('auth_token', newToken);
      sessionStorage.removeItem('auth_token');
    } else {
      sessionStorage.setItem('auth_token', newToken);
      localStorage.removeItem('auth_token');
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
  }, []);

  const updateProfile = useCallback(async (updatedData: Partial<User>) => {
    if (!token || !user) return;
    
    // Optimistic update
    setUser({ ...user, ...updatedData });
    
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      
      if (!res.ok) {
        // Revert on error or re-fetch
        fetchUser();
      }
    } catch (e) {
      console.error(e);
      fetchUser();
    }
  }, [token, user, fetchUser]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
