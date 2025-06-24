import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AntHeader style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
      <div className="logo">作业收集系统</div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={[
          {
            key: '/upload',
            label: <Link to="/upload">上传作业</Link>,
          },
          ...(isAuthenticated
            ? [
                {
                  key: '/dashboard',
                  label: <Link to="/dashboard">管理面板</Link>,
                },
                {
                  key: '/uploads',
                  label: <Link to="/uploads">上传记录</Link>,
                },
                ...(isAdmin
                  ? [
                      {
                        key: '/users',
                        label: <Link to="/users">用户管理</Link>,
                      },
                    ]
                  : []),
              ]
            : []),
        ]}
        style={{ lineHeight: '64px' }}
      />
      {isAuthenticated ? (
        <Button
          onClick={handleLogout}
          style={{ position: 'absolute', right: '20px', top: '15px' }}
          type="primary"
          danger
        >
          退出登录
        </Button>
      ) : (
        <Button
          onClick={() => navigate('/login')}
          style={{ position: 'absolute', right: '20px', top: '15px' }}
          type="primary"
        >
          管理员登录
        </Button>
      )}
    </AntHeader>
  );
};

export default Header;
