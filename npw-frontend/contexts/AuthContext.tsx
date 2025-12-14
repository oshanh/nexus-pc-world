
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

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
    // Check localStorage for persisted user on mount
    const storedUser = localStorage.getItem('nexusUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Optional: Remember admin mode state or default to false for security
      // setAdminMode(parsedUser.role === 'admin'); 
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let role: 'admin' | 'user' = 'user';
    // Hardcoded admin credentials for demo purposes
    if (email === 'admin@nexus.com' && password === 'admin123') {
        role = 'admin';
    }

    const mockUser: User = {
      id: role === 'admin' ? 'admin-001' : 'user-' + Date.now(),
      name: role === 'admin' ? 'Nexus Commander' : email.split('@')[0],
      email: email,
      role: role,
    };
    
    setUser(mockUser);
    if (role === 'admin') {
        setAdminMode(true);
    }
    localStorage.setItem('nexusUser', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: 'user', // Default signups are users
    };

    setUser(newUser);
    setAdminMode(false);
    localStorage.setItem('nexusUser', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
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
