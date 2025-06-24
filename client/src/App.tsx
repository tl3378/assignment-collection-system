import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { useAuth } from './context/AuthContext';

// 组件
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// 页面
import UploadPage from './pages/UploadPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UploadsListPage from './pages/UploadsListPage';
import UsersPage from './pages/UsersPage';
import NotFoundPage from './pages/NotFoundPage';

const { Content } = Layout;

const App: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ padding: '0 50px', marginTop: 64 }}>
        <div className="site-layout-content">
          <Routes>
            {/* 将根路径重定向到上传页面 */}
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/uploads"
              element={
                <ProtectedRoute>
                  <UploadsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute adminOnly>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default App;
