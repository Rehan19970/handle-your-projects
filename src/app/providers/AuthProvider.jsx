import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../../lib/axios';
import { useUIStore } from '../../store/useUIStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const setTheme = useUIStore((state) => state.setTheme);
  const clearWorkspaceState = useWorkspaceStore((state) => state.clearWorkspaceState);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        if (res.data.preferences?.theme) {
          setTheme(res.data.preferences.theme);
        }
      } catch (error) {
        localStorage.removeItem('accessToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setTheme]);

  const login = (userData, token) => {
    localStorage.setItem('accessToken', token);
    setUser(userData);
    if (userData.preferences?.theme) setTheme(userData.preferences.theme);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('accessToken');
    clearWorkspaceState();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);