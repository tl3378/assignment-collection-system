const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const {
  uploadFile,
  getUploads,
  getUploadById,
  deleteUpload,
  downloadFile,
  exportUploads,
  checkClassUploaded,
} = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 检查班级是否已上传 - 公开访问
router.get('/check', checkClassUploaded);

// 上传文件 - 公开访问
router.post(
  '/',
  upload.single('file'),
  [
    check('school', '请输入学校名称').not().isEmpty(),
    check('college', '请输入学院名称').not().isEmpty(),
    check('major', '请输入专业名称').not().isEmpty(),
    check('class', '请输入班级名称').not().isEmpty(),
  ],
  uploadFile
);

// 获取所有上传记录 - 仅管理员可访问
router.get('/', protect, admin, getUploads);

// 导出上传记录为Excel - 仅管理员可访问
router.get('/export', protect, admin, exportUploads);

// 获取单个上传记录 - 仅管理员可访问
router.get('/:id', protect, admin, getUploadById);

// 下载文件 - 仅管理员可访问
router.get('/:id/download', protect, admin, downloadFile);

// 删除上传记录 - 仅管理员可访问
router.delete('/:id', protect, admin, deleteUpload);

module.exports = router;
