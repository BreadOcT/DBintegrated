import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
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
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsLoading(false);
    }
  }, [token]);

  const login = useCallback((newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
  }, []);

  return { user, token, login, logout, isLoading };
}
