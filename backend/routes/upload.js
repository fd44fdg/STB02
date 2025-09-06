const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { createUploader } = require('../middleware/upload');
const { sendSuccess } = require('../utils/responseHandler');

// 上传用于轮播图等图片
// 表单字段名使用 file
const bannerUploader = createUploader({ subdir: 'banners' });

router.post('/banners', verifyToken, isAdmin, bannerUploader.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '未找到上传文件' });
  }
  // 统一返回可直接使用的 URL
  const url = `/static/uploads/banners/${req.file.filename}`;
  sendSuccess(res, { url }, '上传成功', 201);
}));

module.exports = router;
