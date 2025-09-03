const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');
const config = require('../config');

// Ensure upload base directory exists
const baseUploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

function createMulterStorage(subdir) {
  const dest = path.join(baseUploadDir, subdir || '');
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, dest);
    },
    filename: function (req, file, cb) {
      const userId = (req.user && (req.user.id || req.user.userId)) || 'anon';
      const timestamp = Date.now();
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${subdir ? subdir.replace(/[\\/]/g, '-') + '-' : ''}${userId}-${timestamp}${ext}`);
    }
  });
}

function fileTypeFilter(allowedTypes) {
  const allow = new Set(allowedTypes || config.upload.allowedTypes || []);
  return (req, file, cb) => {
    if (allow.size === 0 || allow.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, `不支持的文件类型: ${file.mimetype}`), false);
    }
  };
}

function createUploader({ subdir = '', allowedTypes = config.upload.allowedTypes, maxSize = config.upload.maxSize } = {}) {
  // Convert maxSize like '5mb' or number to bytes
  let limits = {};
  if (typeof maxSize === 'string') {
    const m = maxSize.match(/^(\d+)(kb|mb|gb)$/i);
    if (m) {
      const n = parseInt(m[1], 10);
      const unit = m[2].toLowerCase();
      const factor = unit === 'gb' ? 1024 * 1024 * 1024 : unit === 'mb' ? 1024 * 1024 : 1024;
      limits.fileSize = n * factor;
    }
  } else if (typeof maxSize === 'number') {
    limits.fileSize = maxSize;
  }

  return multer({
    storage: createMulterStorage(subdir),
    fileFilter: fileTypeFilter(allowedTypes),
    limits,
  });
}

module.exports = {
  createUploader,
};
