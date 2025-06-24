const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const {
  loginUser,
  registerUser,
  getUsers,
  deleteUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// 登录路由
router.post(
  '/login',
  [
    check('username', '请输入用户名').optional(),
    check('password', '请输入密码').optional(),
  ],
  loginUser
);

// 注册路由 - 仅管理员可访问
router.post(
  '/',
  [
    protect,
    admin,
    check('username', '请输入用户名').not().isEmpty(),
    check('password', '密码长度至少为6个字符').isLength({ min: 6 }),
  ],
  registerUser
);

// 获取所有用户 - 仅管理员可访问
router.get('/', protect, admin, getUsers);

// 获取用户个人资料
router.get('/profile', protect, getUserProfile);

// 更新用户个人资料
router.put('/profile', protect, updateUserProfile);

// 删除用户 - 仅管理员可访问
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
