const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// 加载环境变量
dotenv.config();

// 创建 Express 应用
const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(morgan('dev'));

// 静态文件目录
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);

// 生产环境下提供前端静态文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../../client/build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

// 错误处理中间件
app.use(notFound);
app.use(errorHandler);

// 创建默认管理员账号
const User = require('./models/User');
const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        isAdmin: true,
      });
      console.log('管理员账号已创建: admin / admin123');
    }
  } catch (error) {
    console.error('创建管理员账号失败:', error);
  }
};

// 启动服务器
const PORT = process.env.PORT || 5000;

// 尝试连接数据库并启动服务器
const startServer = async () => {
  try {
    // 连接数据库
    await connectDB();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在 ${process.env.NODE_ENV} 模式下，端口: ${PORT}`);
      createAdminUser();
    });
  } catch (error) {
    console.error(`无法启动服务器: ${error.message}`);
    
    // 如果是 MongoDB 连接错误，提供更详细的信息
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
      console.error(`
        ======================================
        MongoDB 连接失败。请检查:
        1. MongoDB 是否已安装并运行
        2. .env 文件中的 MONGO_URI 是否正确
        3. 网络连接是否正常
        
        您可以:
        - 安装并启动本地 MongoDB
        - 使用 MongoDB Atlas 云服务
        - 修改 .env 文件中的连接字符串
        ======================================
      `);
    }
    
    process.exit(1);
  }
};

startServer();
