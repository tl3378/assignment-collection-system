const Upload = require('../models/Upload');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const xlsx = require('xlsx');
const iconv = require('iconv-lite');

// 辅助函数：修复中文文件名编码
const fixChineseFilename = (filename) => {
  if (!filename) return '未知文件名';
  
  // 如果是Buffer，直接转为UTF-8
  if (Buffer.isBuffer(filename)) {
    return filename.toString('utf8');
  }
  
  // 如果不是字符串，转换为字符串
  if (typeof filename !== 'string') {
    return String(filename);
  }

  // 处理中文文件名
  try {
    // 尝试不同的编码方式解码
    const encodings = ['utf8', 'latin1', 'gbk', 'gb2312', 'big5'];
    
    // 首先检查是否包含乱码字符
    const containsGarbledChars = /é|è|®|¿|Ç|¢|£|¤|¥|¦|§|¨|©|ª|«|¬|­|®|¯|°|±|²|³|´|µ|¶|·|¸|¹|º|»|¼|½|¾|¿|À|Á|Â|Ã|Ä|Å|Æ|Ç|È|É|Ê|Ë|Ì|Í|Î|Ï|Ð|Ñ|Ò|Ó|Ô|Õ|Ö|×|Ø|Ù|Ú|Û|Ü|Ý|Þ|ß|à|á|â|ã|ä|å|æ|ç|è|é|ê|ë|ì|í|î|ï|ð|ñ|ò|ó|ô|õ|ö|÷|ø|ù|ú|û|ü|ý|þ|ÿ/.test(filename);
    
    if (containsGarbledChars) {
      // 尝试从latin1转换为utf8（常见的乱码原因）
      return iconv.decode(Buffer.from(filename, 'latin1'), 'utf8');
    }
    
    // 如果没有明显的乱码字符，检查是否已经是有效的UTF-8
    try {
      const testBuf = Buffer.from(filename);
      const decoded = iconv.decode(testBuf, 'utf8');
      if (decoded === filename) {
        return filename; // 已经是有效的UTF-8
      }
    } catch (e) {}
    
    // 尝试各种编码
    for (const encoding of encodings) {
      try {
        if (iconv.encodingExists(encoding)) {
          const buf = Buffer.from(filename, 'binary');
          const decoded = iconv.decode(buf, encoding);
          // 检查解码后的结果是否包含中文字符
          if (/[\u4e00-\u9fa5]/.test(decoded)) {
            return decoded;
          }
        }
      } catch (e) {}
    }
    
    // 如果上述方法都失败，使用特殊映射表
    const charMap = {
      'é': '采', 'è': '访', '®': '访', '¿': '问', 'Ç': '采'
    };
    
    let result = filename;
    for (const [garbled, chinese] of Object.entries(charMap)) {
      result = result.replace(new RegExp(garbled, 'g'), chinese);
    }
    
    return result;
  } catch (e) {
    console.error('文件名编码转换失败:', e);
    return filename;
  }
};

// @desc    上传作业文件
// @route   POST /api/uploads
// @access  Public
const uploadFile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // 如果上传了文件但表单验证失败，删除已上传的文件
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: '请上传文件' });
    }
    
    const { school, college, major, class: className, contact, remark } = req.body;

    // 获取并确保原始文件名编码正确
    let originalName = '';
    
    // 首先尝试从fileInfo中获取
    if (req.fileInfo && req.fileInfo.originalName) {
      originalName = req.fileInfo.originalName;
      console.log('使用fileInfo中的文件名:', originalName);
    } else {
      // 否则从req.file中获取并处理编码
      originalName = fixChineseFilename(req.file.originalname);
      console.log('处理后的原始文件名:', originalName);
    }

    // 检查是否已存在相同学校、学院、专业、班级的记录
    const existingUpload = await Upload.findOne({
      school,
      college,
      major,
      class: className,
    });

    if (existingUpload) {
      // 如果存在，删除旧文件
      if (fs.existsSync(existingUpload.filePath)) {
        fs.unlinkSync(existingUpload.filePath);
      }

      // 更新记录
      existingUpload.filePath = req.file.path;
      existingUpload.fileName = req.file.filename;
      existingUpload.originalName = originalName;
      existingUpload.fileSize = req.file.size;
      existingUpload.contact = contact || existingUpload.contact;
      existingUpload.remark = remark || existingUpload.remark;
      existingUpload.uploadTime = Date.now();
      existingUpload.uploaderIp = req.ip;

      await existingUpload.save();
      
      console.log('更新上传记录，文件名:', originalName);

      return res.status(200).json({
        message: '文件上传成功（覆盖旧文件）',
        upload: existingUpload,
      });
    }

    // 创建新记录
    const upload = new Upload({
      school,
      college,
      major,
      class: className,
      contact: contact || '',
      remark: remark || '',
      filePath: req.file.path,
      fileName: req.file.filename,
      originalName: originalName,
      fileSize: req.file.size,
      uploaderIp: req.ip,
    });

    await upload.save();
    console.log('新建上传记录，文件名:', originalName);

    res.status(201).json({
      message: '文件上传成功',
      upload,
    });
  } catch (error) {
    // 如果发生错误，删除已上传的文件
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    console.error('上传错误:', error);

    // 处理唯一性约束错误
    if (error.code === 11000) {
      return res.status(400).json({
        message: '该班级已上传过作业，请联系管理员',
      });
    }

    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// @desc    获取所有上传记录
// @route   GET /api/uploads
// @access  Private/Admin
const getUploads = async (req, res) => {
  try {
    // 获取查询参数
    const { school, college, major, class: className, startDate, endDate } = req.query;
    
    // 构建查询条件
    const query = {};
    
    if (school) query.school = { $regex: school, $options: 'i' };
    if (college) query.college = { $regex: college, $options: 'i' };
    if (major) query.major = { $regex: major, $options: 'i' };
    if (className) query.class = { $regex: className, $options: 'i' };
    
    // 日期范围查询
    if (startDate || endDate) {
      query.uploadTime = {};
      if (startDate) query.uploadTime.$gte = new Date(startDate);
      if (endDate) query.uploadTime.$lte = new Date(endDate);
    }
    
    // 执行查询并按上传时间降序排序
    const uploads = await Upload.find(query).sort({ uploadTime: -1 });
    
    res.json(uploads);
  } catch (error) {
    console.error('获取上传记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取单个上传记录
// @route   GET /api/uploads/:id
// @access  Private/Admin
const getUploadById = async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    
    if (upload) {
      res.json(upload);
    } else {
      res.status(404).json({ message: '未找到上传记录' });
    }
  } catch (error) {
    console.error('获取单个上传记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    删除上传记录
// @route   DELETE /api/uploads/:id
// @access  Private/Admin
const deleteUpload = async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    
    if (upload) {
      // 删除文件
      if (fs.existsSync(upload.filePath)) {
        fs.unlinkSync(upload.filePath);
      }
      
      // 删除记录
      await upload.deleteOne();
      
      res.json({ message: '上传记录已删除' });
    } else {
      res.status(404).json({ message: '未找到上传记录' });
    }
  } catch (error) {
    console.error('删除上传记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    下载单个文件
// @route   GET /api/uploads/:id/download
// @access  Private/Admin
const downloadFile = async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    
    if (!upload) {
      return res.status(404).json({ message: '未找到上传记录' });
    }
    
    if (!fs.existsSync(upload.filePath)) {
      return res.status(404).json({ message: '文件不存在' });
    }
    
    // 修复文件名编码
    const originalName = fixChineseFilename(upload.originalName);
    console.log('下载文件，原始文件名:', upload.originalName);
    console.log('下载文件，处理后文件名:', originalName);
    
    // 设置Content-Type以确保浏览器正确处理文件
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // 使用标准的UTF-8编码处理文件名
    const encodedFilename = encodeURIComponent(originalName).replace(/['()]/g, escape);
    
    // 设置多种Content-Disposition头，兼容不同浏览器
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`);
    
    // 发送文件
    res.sendFile(path.resolve(upload.filePath));
  } catch (error) {
    console.error('下载文件错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    导出所有上传记录为Excel
// @route   GET /api/uploads/export
// @access  Private/Admin
const exportUploads = async (req, res) => {
  try {
    // 获取查询参数
    const { school, college, major, class: className, startDate, endDate } = req.query;
    
    // 构建查询条件
    const query = {};
    
    if (school) query.school = { $regex: school, $options: 'i' };
    if (college) query.college = { $regex: college, $options: 'i' };
    if (major) query.major = { $regex: major, $options: 'i' };
    if (className) query.class = { $regex: className, $options: 'i' };
    
    // 日期范围查询
    if (startDate || endDate) {
      query.uploadTime = {};
      if (startDate) query.uploadTime.$gte = new Date(startDate);
      if (endDate) query.uploadTime.$lte = new Date(endDate);
    }
    
    // 执行查询并按上传时间降序排序
    const uploads = await Upload.find(query).sort({ uploadTime: -1 });
    
    // 准备Excel数据
    const workbook = xlsx.utils.book_new();
    
    // 转换数据为表格格式，确保中文文件名正确显示
    const excelData = uploads.map(upload => {
      // 修复文件名编码
      const originalName = fixChineseFilename(upload.originalName);
      console.log('Excel导出，文件名:', originalName);
      
      return {
        '学校': upload.school,
        '学院': upload.college,
        '专业': upload.major,
        '班级': upload.class,
        '联系人': upload.contact || '',
        '备注': upload.remark || '',
        '文件名': originalName,
        '文件大小(MB)': (upload.fileSize / (1024 * 1024)).toFixed(2),
        '上传时间': upload.uploadTime.toLocaleString(),
        '上传IP': upload.uploaderIp,
      };
    });
    
    // 创建工作表，确保正确的编码
    const worksheet = xlsx.utils.json_to_sheet(excelData);
    
    // 添加工作表到工作簿
    xlsx.utils.book_append_sheet(workbook, worksheet, '上传记录');
    
    // 设置Excel文件的属性以确保Unicode支持
    workbook.Workbook = workbook.Workbook || {};
    workbook.Workbook.Views = workbook.Workbook.Views || [];
    workbook.Workbook.Views[0] = { RTL: false };
    
    // 生成Excel文件
    const excelFileName = `uploads_${Date.now()}.xlsx`;
    const excelFilePath = path.join(__dirname, '../uploads', excelFileName);
    
    // 写入文件，使用UTF8设置
    xlsx.writeFile(workbook, excelFilePath, { bookType: 'xlsx', type: 'file', compression: true });
    
    // 发送文件
    res.download(excelFilePath, excelFileName, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: '导出失败' });
      }
      
      // 下载完成后删除临时文件
      fs.unlinkSync(excelFilePath);
    });
  } catch (error) {
    console.error('导出Excel错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    检查班级是否已上传
// @route   GET /api/uploads/check
// @access  Public
const checkClassUploaded = async (req, res) => {
  try {
    const { school, college, major, class: className } = req.query;
    
    if (!school || !college || !major || !className) {
      return res.status(400).json({ message: '请提供完整的班级信息' });
    }
    
    // 查询是否存在
    const upload = await Upload.findOne({
      school,
      college,
      major,
      class: className,
    });
    
    res.json({
      exists: !!upload,
      upload: upload || null,
    });
  } catch (error) {
    console.error('检查班级上传状态错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  uploadFile,
  getUploads,
  getUploadById,
  deleteUpload,
  downloadFile,
  exportUploads,
  checkClassUploaded,
};
