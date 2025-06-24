import axios from 'axios';

// 设置基础 URL - 使用 5001 端口
axios.defaults.baseURL = 'http://localhost:5001';

// 添加请求拦截器，用于调试
axios.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.url, config.method, config.data);
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器处理错误
axios.interceptors.response.use(
  (response) => {
    console.log('收到响应:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('响应错误:', error);
    
    // 处理 401 错误 (未授权)
    if (error.response && error.response.status === 401) {
      // 如果不是登录页面，清除本地存储并重定向到登录页
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 获取认证头
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 上传接口
export const uploadAssignment = async (formData: FormData) => {
  const response = await axios.post('/api/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// 检查班级是否已上传
export const checkClassUploaded = async (
  school: string,
  college: string,
  major: string,
  className: string
) => {
  const response = await axios.get(
    `/api/uploads/check?school=${encodeURIComponent(
      school
    )}&college=${encodeURIComponent(college)}&major=${encodeURIComponent(
      major
    )}&class=${encodeURIComponent(className)}`
  );
  return response.data;
};

// 获取所有上传记录
export const getUploads = async (filters?: any) => {
  let url = '/api/uploads';
  
  if (filters) {
    const queryParams = new URLSearchParams();
    
    if (filters.school) queryParams.append('school', filters.school);
    if (filters.college) queryParams.append('college', filters.college);
    if (filters.major) queryParams.append('major', filters.major);
    if (filters.class) queryParams.append('class', filters.class);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
  }
  
  const response = await axios.get(url, {
    headers: getAuthHeader()
  });
  return response.data;
};

// 删除上传记录
export const deleteUpload = async (id: string) => {
  const response = await axios.delete(`/api/uploads/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// 下载文件
export const downloadFile = (id: string) => {
  const token = localStorage.getItem('token');
  window.open(`${axios.defaults.baseURL}/api/uploads/${id}/download?token=${token}`, '_blank');
};

// 导出Excel
export const exportToExcel = (filters?: any) => {
  let url = '/api/uploads/export';
  
  if (filters) {
    const queryParams = new URLSearchParams();
    
    if (filters.school) queryParams.append('school', filters.school);
    if (filters.college) queryParams.append('college', filters.college);
    if (filters.major) queryParams.append('major', filters.major);
    if (filters.class) queryParams.append('class', filters.class);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
  }
  
  const token = localStorage.getItem('token');
  window.open(`${axios.defaults.baseURL}${url}&token=${token}`, '_blank');
};

// 获取所有用户
export const getUsers = async () => {
  const response = await axios.get('/api/users', {
    headers: getAuthHeader()
  });
  return response.data;
};

// 创建用户
export const createUser = async (userData: { username: string; password: string; isAdmin: boolean }) => {
  const response = await axios.post('/api/users', userData, {
    headers: getAuthHeader()
  });
  return response.data;
};

// 删除用户
export const deleteUser = async (id: string) => {
  const response = await axios.delete(`/api/users/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};
