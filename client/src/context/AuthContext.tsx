import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin } from '../utils/api';

interface User {
  _id: string;
  username: string;
  isAdmin: boolean;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化时从localStorage加载用户信息
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse user from localStorage:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // 登录方法
  const login = async (username: string, password: string) => {
    try {
      const userData = await apiLogin(username, password);
      
      // 保存用户信息和token到localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // 登出方法
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
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

export default AuthContext;
