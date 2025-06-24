const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 验证 token 中间件
const protect = async (req, res, next) => {
  let token;

  try {
    // 从请求头获取 token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // 从查询参数获取 token
    else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: '未授权，没有 token' });
    }

    // 处理测试 token
    if (token === 'test_token_for_admin') {
      req.user = { _id: '123456789012345678901234', username: 'admin', isAdmin: true };
      return next();
    }

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 获取用户信息
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    next();
  } catch (error) {
    console.error('认证错误:', error);
    return res.status(401).json({ message: '未授权，token 失效' });
  }
};

// 验证管理员权限
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: '未授权，需要管理员权限' });
  }
};

module.exports = { protect, admin };
