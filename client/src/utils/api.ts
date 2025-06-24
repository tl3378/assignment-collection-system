import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器，添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 登录
export const login = async (username: string, password: string) => {
  const response = await api.post('/users/login', { username, password });
  return response.data;
};

// 获取用户列表
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

// 创建用户
export const createUser = async (userData: any) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// 删除用户
export const deleteUser = async (userId: string) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// 上传作业
export const uploadAssignment = async (formData: FormData) => {
  const response = await api.post('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// 获取上传列表
export const getUploads = async (filters = {}) => {
  const response = await api.get('/uploads', { params: filters });
  return response.data;
};

// 删除上传记录
export const deleteUpload = async (uploadId: string) => {
  const response = await api.delete(`/uploads/${uploadId}`);
  return response.data;
};

// 下载文件
export const downloadFile = (uploadId: string) => {
  const token = localStorage.getItem('token');
  window.open(`${api.defaults.baseURL}/uploads/${uploadId}/download?token=${token}`, '_blank');
};

// 导出Excel
export const exportExcel = (filters = {}) => {
  const token = localStorage.getItem('token');
  const queryString = new URLSearchParams(filters as Record<string, string>).toString();
  window.open(`${api.defaults.baseURL}/uploads/export?token=${token}&${queryString}`, '_blank');
};

// 检查班级是否已上传
export const checkClassUploaded = async (school: string, college: string, major: string, className: string) => {
  const response = await api.get('/uploads/check', {
    params: { school, college, major, class: className }
  });
  return response.data;
};

export default api;
