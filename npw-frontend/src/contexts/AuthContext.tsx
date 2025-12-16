
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { authService } from '../services/authService';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// Backend API response types
interface BackendUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

interface MeResponse {
  user: BackendUser;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
   updateProfile: (newName: string) => void;
  isLoading: boolean;
  isAdmin: boolean;
  adminMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    // On mount try to load current user from the session cookie
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const res: MeResponse = await authService.me();
        const backendUser = res.user;
        const appUser: User = { id: backendUser.id, name: backendUser.username, email: backendUser.email, role: backendUser.role };
        setUser(appUser);
        setAdminMode(appUser.role === 'admin');
        localStorage.setItem('nexusUser', JSON.stringify(appUser));
      } catch (err) {
        console.warn('No active session found', err);
        setUser(null);
        setAdminMode(false);
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
      const res: MeResponse = await authService.me();
      const backendUser = res.user;
      const appUser: User = { id: backendUser.id, name: backendUser.username, email: backendUser.email, role: backendUser.role };
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

  const updateProfile = (newName: string) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, name: newName };
      try { localStorage.setItem('nexusUser', JSON.stringify(updated)); } catch (err) { /* ignore */ }
      return updated;
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Server sets httpOnly cookie on signup; after signup fetch /me
      await authService.signup(name, email, password);
      const res: MeResponse = await authService.me();
      const backendUser = res.user;
      const appUser: User = { id: backendUser.id, name: backendUser.username, email: backendUser.email, role: backendUser.role };
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

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    adminMode: user?.role === 'admin' && adminMode,
    login,
    signup,
    logout,
    updateProfile,
    isLoading,
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
