const express = require('express');
const path = require('path');
const { createUploader } = require('../middleware/upload');
const { verifyToken: authMiddleware } = require('../middleware/auth');
const { sendSuccess } = require('../utils/responseHandler');
const ApiError = require('../utils/ApiError');
const { asyncHandler } = require('../middleware/errorHandler');
const userService = require('../services/userService');
const config = require('../config');

const router = express.Router();

// 使用统一上传中间件（avatars 子目录，复用全局大小/类型限制）
const avatarUploader = createUploader({ subdir: 'avatars' });


router.get('/profile', authMiddleware, asyncHandler(async (req, res) => {
  const userProfile = await userService.getUserProfile(req.user.userId);
  sendSuccess(res, { user: userProfile });
}));

router.put('/profile', authMiddleware, asyncHandler(async (req, res) => {
  const updatedUserProfile = await userService.updateProfile(req.user.userId, req.body);
  sendSuccess(res, updatedUserProfile, '用户信息更新成功');
}));

router.put('/password', authMiddleware, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user.userId, currentPassword, newPassword);
  sendSuccess(res, null, '密码修改成功');
}));

router.post('/avatar', authMiddleware, avatarUploader.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, '请选择要上传的头像');
  }
  
  const avatarUrl = `/static/uploads/avatars/${req.file.filename}`;
  const result = await userService.updateAvatar(req.user.userId, avatarUrl);
  sendSuccess(res, result, '头像上传成功');
}));

router.get('/stats', authMiddleware, asyncHandler(async (req, res) => {
  const userStats = await userService.getUserStats(req.user.userId);
  sendSuccess(res, userStats);
}));

router.get('/checkin/status', authMiddleware, asyncHandler(async (req, res) => {
  const checkInStatus = await userService.getCheckinStatus(req.user.userId);
  sendSuccess(res, checkInStatus);
}));

router.post('/checkin', authMiddleware, asyncHandler(async (req, res) => {
  const result = await userService.performCheckin(req.user.userId);
  sendSuccess(res, result, '签到成功！');
}));

router.post('/stats/update', authMiddleware, asyncHandler(async (req, res) => {
  const { isCorrect, questionId } = req.body;
  await userService.updateUserStats(req.user.userId, isCorrect, questionId);
  sendSuccess(res, null, '统计数据更新成功');
}));

router.get('/list', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 40301, message: '无权访问' });
  }

  const result = await userService.getUserList(req.query);
  sendSuccess(res, result, 'Success');
}));

router.post('/create', authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 40301, message: '无权访问' });
  }

  const newUser = await userService.createUser(req.body);
  sendSuccess(res, newUser, '用户创建成功', 201);
}));

router.put('/update/:id', authMiddleware, asyncHandler(async (req, res) => {
    const userIdToUpdate = parseInt(req.params.id, 10);
    const updatedUser = await userService.updateUser(userIdToUpdate, req.body, req.user.userId, req.user.role);
    sendSuccess(res, updatedUser, '更新成功');
}));

router.delete('/delete/:id', authMiddleware, asyncHandler(async (req, res) => {
    const userIdToDelete = parseInt(req.params.id, 10);
    await userService.deleteUser(userIdToDelete, req.user.userId, req.user.role);
    sendSuccess(res, null, '用户删除成功');
}));

module.exports = router;