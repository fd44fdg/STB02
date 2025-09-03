const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { sendSuccess } = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/errorHandler');
const authService = require('../services/authService');

const router = express.Router();

router.post('/register', asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV !== 'production' && req.baseUrl && req.baseUrl.endsWith('/api/v1')) {
    res.setHeader('Deprecation', 'true');
    res.setHeader('Link', '</api/v1/auth/register>; rel="successor-version"');
  }
  const newUser = await authService.register(req.body);
  sendSuccess(res, newUser, '注册成功', 201);
}));

router.post('/login', asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV !== 'production' && req.baseUrl && req.baseUrl.endsWith('/api/v1')) {
    res.setHeader('Deprecation', 'true');
    res.setHeader('Link', '</api/v1/auth/login>; rel="successor-version"');
  }
  const result = await authService.login(req.body);
  sendSuccess(res, result, '登录成功');
}));

router.post('/change-password', verifyToken, asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  sendSuccess(res, null, '密码修改成功');
}));

router.post('/logout', verifyToken, asyncHandler(async (req, res) => {
  sendSuccess(res, null, '退出登录成功');
}));

router.get('/verify', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const ApiError = require('../utils/ApiError');
  const jwt = require('jsonwebtoken');
  const db = require('../config/db');
  const config = require('../config');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, '未提供认证令牌');
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: [config.jwt.algorithm || 'HS256'],
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });
    const user = await db('users')
      .select('id', 'username', 'email', 'nickname', 'avatar_url', 'role')
      .where({ id: decoded.id })
      .first();
    
    if (!user) {
      throw new ApiError(401, '用户不存在');
    }
    
    sendSuccess(res, { user }, '令牌有效');
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, '认证令牌已过期');
    } else {
      throw new ApiError(401, '无效的认证令牌');
    }
  }
}));

router.post('/wechat-login', asyncHandler(async (req, res) => {
  const result = await authService.wechatLogin(req.body.code);
  sendSuccess(res, result, '登录成功');
}));

module.exports = router;
