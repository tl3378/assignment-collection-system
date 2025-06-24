import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  isAdmin: boolean;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 从本地存储加载用户数据
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        console.log('从本地存储加载用户:', storedUser);
        console.log('从本地存储加载token:', storedToken);

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          
          // 设置全局 axios 默认头部
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          console.log('已设置 Authorization 头部');
        }
      } catch (error) {
        console.error('加载用户数据时出错:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // 登录函数
  const login = async (username: string, password: string) => {
    try {
      console.log('尝试登录:', username);
      
      const { data } = await axios.post('/api/users/login', {
        username,
        password,
      });

      console.log('登录响应:', data);

      // 确保响应中包含必要的用户信息和token
      if (!data._id || !data.username || data.isAdmin === undefined || !data.token) {
        throw new Error('服务器响应缺少必要的用户信息');
      }

      const userData = {
        _id: data._id,
        username: data.username,
        isAdmin: data.isAdmin
      };

      setUser(userData);
      setToken(data.token);

      // 保存到本地存储
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', data.token);
      console.log('用户数据已保存到本地存储');

      // 设置全局 axios 默认头部
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      console.log('已设置 Authorization 头部');
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  // 登出函数
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    console.log('用户已登出');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
