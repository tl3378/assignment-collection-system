const multer = require('multer');
const path = require('path');
const fs = require('fs');
const iconv = require('iconv-lite');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 辅助函数：修复中文文件名编码
const fixChineseFilename = (filename) => {
  if (!filename) return '';
  
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

// 配置存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    
    // 处理原始文件名，修复中文编码
    let originalName = file.originalname;
    console.log('原始文件名:', originalName);
    
    // 修复中文文件名
    originalName = fixChineseFilename(originalName);
    console.log('处理后文件名:', originalName);
    
    // 获取文件扩展名
    const fileExt = path.extname(originalName);
    
    // 生成不含中文的唯一文件名
    const fileName = `${uniqueSuffix}${fileExt}`;
    console.log('保存的文件名:', fileName);
    
    // 保存正确编码的原始文件名到req对象
    if (!req.fileInfo) req.fileInfo = {};
    req.fileInfo.originalName = originalName;
    
    cb(null, fileName);
  },
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = ['.zip', '.rar', '.7z'];
  
  // 处理文件名编码
  let originalName = fixChineseFilename(file.originalname);
  
  // 获取文件扩展名
  const ext = path.extname(originalName).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传 .zip, .rar, .7z 格式的文件'), false);
  }
};

// 设置上传限制
const maxSize = process.env.MAX_FILE_SIZE || 1024 * 1024 * 1024; // 1GB

// 创建 multer 实例
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(maxSize),
  },
});

module.exports = upload;
