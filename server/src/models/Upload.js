const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
  school: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },
  major: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: false,
  },
  remark: {
    type: String,
    required: false,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  uploadTime: {
    type: Date,
    default: Date.now,
  },
  uploaderIp: {
    type: String,
    required: false,
  },
});

// 创建复合索引，确保学校+学院+专业+班级的组合唯一
UploadSchema.index({ school: 1, college: 1, major: 1, class: 1 }, { unique: true });

module.exports = mongoose.model('Upload', UploadSchema);
