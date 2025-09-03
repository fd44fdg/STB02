const express = require('express');
const { verifyToken: authMiddleware } = require('../middleware/auth');
const { sendSuccess } = require('../utils/responseHandler');
const ApiError = require('../utils/ApiError');
const { asyncHandler } = require('../middleware/errorHandler');
const adminService = require('../services/adminService');

const router = express.Router();

// Admin permission middleware
const requireAdmin = asyncHandler(async (req, res, next) => {
  await adminService.verifyAdminPermission(req.user.id || req.user.userId);
  next();
});

// Apply authentication and admin requirements to all routes
router.use(authMiddleware, requireAdmin);

// ===================================
// Dashboard Statistics
// ===================================

router.get('/dashboard/stats', asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  sendSuccess(res, stats);
}));

router.get('/stats', asyncHandler(async (req, res) => {
  const stats = await adminService.getSystemStats();
  sendSuccess(res, stats);
}));

router.get('/activities', asyncHandler(async (req, res) => {
  const activities = await adminService.getRecentActivities();
  sendSuccess(res, activities);
}));

router.get('/stats/user-growth', asyncHandler(async (req, res) => {
  const growthData = await adminService.getUserGrowthData();
  sendSuccess(res, growthData);
}));

router.get('/stats/category-distribution', asyncHandler(async (req, res) => {
  const distribution = await adminService.getCategoryDistribution();
  sendSuccess(res, distribution);
}));

// ===================================
// User Management
// ===================================

router.get('/users', asyncHandler(async (req, res) => {
  const result = await adminService.getUserList(req.query);
  sendSuccess(res, result);
}));

router.post('/users', asyncHandler(async (req, res) => {
  const result = await adminService.createUser(req.body);
  sendSuccess(res, result, '用户创建成功');
}));

router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await adminService.getUserById(req.params.id);
  sendSuccess(res, { user });
}));

router.put('/users/:id', asyncHandler(async (req, res) => {
  await adminService.updateUser(req.params.id, req.body);
  sendSuccess(res, null, '用户更新成功');
}));

router.delete('/users/:id', asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.params.id);
  sendSuccess(res, null, '用户删除成功');
}));

router.get('/users/:id/stats', asyncHandler(async (req, res) => {
  const userStats = await adminService.getUserStats(req.params.id);
  sendSuccess(res, userStats);
}));

router.put('/users/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (status === undefined) throw new ApiError(400, '缺少status参数');
  
  const result = await adminService.updateUserStatus(req.params.id, status);
  sendSuccess(res, result, '用户状态更新成功');
}));

module.exports = router;