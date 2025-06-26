# 作业收集系统

一个用于教育机构收集学生作业的Web应用系统，包含前端上传界面和管理员后台。

## 功能特点

### 公开上传页面
- 学生可以提交作业文件（支持.zip/.rar/.7z格式）
- 按学校、学院、专业、班级分类
- 文件大小限制（最大1GB）
- 防止重复提交（同一班级）

### 管理员后台
- 安全登录系统
- 查看所有提交记录
- 下载作业文件
- 导出提交记录为Excel
- 用户管理

## 技术栈

### 前端
- React
- TypeScript
- Ant Design UI库
- Axios

### 后端
- Node.js
- Express
- MongoDB (开发环境使用MongoDB Memory Server)
- JWT认证
- Multer文件上传

## 安装与使用

### 前提条件
- Node.js (v14+)
- npm 或 yarn

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/yourusername/assignment-collection-system.git
cd assignment-collection-system
```

2. 安装依赖
```bash
# 安装根目录依赖
npm install

# 安装客户端依赖
cd client
npm install

# 安装服务器依赖
cd ../server
npm install
```

3. 配置环境变量
在server目录下创建.env文件：
```
NODE_ENV=development
PORT=5001
JWT_SECRET=your_jwt_secret_key
```

4. 运行开发服务器
```bash
# 在项目根目录运行
npm run dev
```

## 部署

推荐使用Railway.app进行部署：
1. 连接GitHub仓库
2. 配置环境变量
3. 自动部署

## 许可证

MIT
