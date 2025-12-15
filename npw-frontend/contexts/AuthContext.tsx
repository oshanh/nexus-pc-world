
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { authService } from '../services/authService';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAdmin: boolean;
  adminMode: boolean;
  toggleAdminMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    // On mount try to load current user from token
    const loadUser = async () => {
      const token = localStorage.getItem('nexusToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res: any = await authService.me();
        const backendUser = res.user;
        const appUser = { id: backendUser.id, name: backendUser.username, email: backendUser.email, role: backendUser.role };
        setUser(appUser);
        localStorage.setItem('nexusUser', JSON.stringify(appUser));
      } catch (err) {
        console.error('Failed to load user from token', err);
        localStorage.removeItem('nexusToken');
        localStorage.removeItem('nexusUser');
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // The server sets an httpOnly cookie for authentication; call login then get /me
      await authService.login(email, password);
      const res: any = await authService.me();
      const backendUser = res.user;
      const appUser = { id: backendUser.id, name: backendUser.username, email: backendUser.email, role: backendUser.role };
      localStorage.setItem('nexusUser', JSON.stringify(appUser));
      setUser(appUser);
      if (appUser.role === 'admin') setAdminMode(true);
    } catch (err) {
      console.error('Login error', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Server sets httpOnly cookie on signup; after signup fetch /me
      await authService.signup(name, email, password);
      const res: any = await authService.me();
      const backendUser = res.user;
      const appUser = { id: backendUser.id, name: backendUser.username, email: backendUser.email, role: backendUser.role };
      localStorage.setItem('nexusUser', JSON.stringify(appUser));
      setUser(appUser);
      setAdminMode(false);
    } catch (err) {
      console.error('Signup error', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Call server to clear the httpOnly cookie, and clear front-end state
    authService.logout().catch(err => console.warn('Logout request failed', err));
    setUser(null);
    setAdminMode(false);
    localStorage.removeItem('nexusUser');
  };

  const toggleAdminMode = () => {
      if (user?.role === 'admin') {
          setAdminMode(prev => !prev);
      }
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    adminMode: user?.role === 'admin' && adminMode,
    login,
    signup,
    logout,
    isLoading,
    toggleAdminMode
  }), [user, isLoading, adminMode]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
