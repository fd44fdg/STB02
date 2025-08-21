const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // 引入 axios
const { query, getOne, insert } = require('../config/database-adapter');
const { verifyToken } = require('../middleware/auth');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// 微信小程序配置
const WECHAT_APP_ID = process.env.WECHAT_APP_ID || 'YOUR_WECHAT_APP_ID';
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET || 'YOUR_WECHAT_APP_SECRET';

/**
 * 用户注册
 * @route POST /auth/register
 * @access Public
 */
router.post('/auth/register', catchAsync(async (req, res) => {
  const { username, email, password, nickname } = req.body;
  
  // 验证必填字段
  if (!username || !email || !password) {
    throw new ApiError(400, '用户名、邮箱和密码为必填项');
  }
  
  // 检查用户名是否已存在
  const existingUser = await getOne('SELECT id FROM users WHERE username = ?', [username]);
  if (existingUser) {
    throw new ApiError(400, '用户名已被使用');
  }
  
  // 检查邮箱是否已存在
  const existingEmail = await getOne('SELECT id FROM users WHERE email = ?', [email]);
  if (existingEmail) {
    throw new ApiError(400, '邮箱已被注册');
  }
  
  // 密码加密
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // 创建用户
  const userData = {
    username,
    email,
    password_hash: hashedPassword,
    nickname: nickname || username
  };
  
  const result = await insert('users', userData);
  
  // 生成JWT令牌
  const token = jwt.sign(
    { id: result.id, username, role: 'user' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  
  // 返回用户信息（不含密码）和令牌
  res.status(201).json({
    code: 200,
    message: '注册成功',
    data: {
      token,
      user: {
        id: result.id,
        username,
        email,
        nickname: nickname || username,
        role: 'user'
      }
    }
  });
}));

/**
 * 用户登录
 * @route POST /auth/login
 * @access Public
 */
router.post('/auth/login', catchAsync(async (req, res) => {
  const { username, password } = req.body;
  
  // 验证必填字段
  if (!username || !password) {
    throw new ApiError(400, '用户名和密码为必填项');
  }
  
  // 查询用户
  const user = await getOne('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
  
  if (!user) {
    throw new ApiError(401, '用户名或密码错误');
  }
  
  // 验证密码
  const isMatch = await bcrypt.compare(password, user.password_hash);
  
  if (!isMatch) {
    throw new ApiError(401, '用户名或密码错误');
  }
  
  // 生成JWT令牌
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  
  // 返回用户信息（不含密码）和令牌
  res.json({
    code: 200,
    message: '登录成功',
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar_url,
        role: user.role
      }
    }
  });
}));

/**
 * 修改密码
 * @route POST /auth/change-password
 * @access Private
 */
router.post('/auth/change-password', verifyToken, catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;
  
  // 验证必填字段
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, '旧密码和新密码为必填项');
  }
  
  // 查询用户
  const user = await getOne('SELECT * FROM users WHERE id = ?', [userId]);
  
  if (!user) {
    throw new ApiError(404, '用户不存在');
  }
  
  // 验证旧密码
  const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
  
  if (!isMatch) {
    throw new ApiError(400, '旧密码错误');
  }
  
  // 检查新密码是否与旧密码相同
  if (oldPassword === newPassword) {
    throw new ApiError(400, '新密码不能与旧密码相同');
  }
  
  // 密码加密
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
  // 更新密码
  await query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);
  
  res.json({
    code: 200,
    message: '密码修改成功'
  });
}));

/**
 * 退出登录
 * @route POST /auth/logout
 * @access Private
 */
router.post('/auth/logout', verifyToken, catchAsync(async (req, res) => {
  // 实际上，JWT令牌是无状态的，服务器端无法使其失效
  // 客户端需要自行清除令牌
  
  res.json({
    code: 200,
    message: '退出登录成功'
  });
}));

/**
 * 验证令牌
 * @route GET /auth/verify
 * @access Public
 */
router.get('/auth/verify', catchAsync(async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, '未提供认证令牌');
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 查询用户
    const user = await getOne('SELECT id, username, email, nickname, avatar_url, role FROM users WHERE id = ?', [decoded.id]);
    
    if (!user) {
      throw new ApiError(401, '用户不存在');
    }
    
    res.json({
      code: 200,
      message: '令牌有效',
      data: {
        user
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, '认证令牌已过期');
    } else {
      throw new ApiError(401, '无效的认证令牌');
    }
  }
}));

/**
 * 微信一键登录
 * @route POST /auth/wechatLogin
 * @access Public
 */
router.post('/auth/wechatLogin', catchAsync(async (req, res) => {
  const { code, userInfo } = req.body;

  if (!code) {
    throw new ApiError(400, '缺少微信登录凭证code');
  }

  // 1. 调用微信接口获取 openid 和 session_key
  const wechatApiUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APP_ID}&secret=${WECHAT_APP_SECRET}&js_code=${code}&grant_type=authorization_code`;
  const wechatRes = await axios.get(wechatApiUrl);
  const { openid, session_key, errcode, errmsg } = wechatRes.data;

  if (errcode) {
    throw new ApiError(400, `微信登录失败: ${errmsg || '未知错误'}`);
  }

  // 2. 根据 openid 查询用户
  let user = await getOne('SELECT id, username, email, nickname, avatar_url, role, openid FROM users WHERE openid = ?', [openid]);

  if (!user) {
    // 3. 如果用户不存在，则自动注册
    const newUsername = `wx_${openid.substring(0, 8)}`; // 简单生成一个用户名
    const newEmail = `${newUsername}@wechat.com`; // 简单生成一个邮箱
    const defaultAvatar = userInfo.avatarUrl || '/public/default-avatar.svg';

    const userData = {
      username: newUsername,
      email: newEmail,
      password_hash: '', // 微信登录无需密码
      nickname: userInfo.nickName || newUsername,
      avatar_url: defaultAvatar,
      openid: openid
    };

    const result = await insert('users', userData);
    user = { id: result.id, ...userData };

  } else {
    // 更新最后登录时间
  }

  // 4. 生成JWT令牌
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, openid: user.openid },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  // 返回用户信息（不含敏感信息）和令牌
  res.json({
    code: 200,
    message: '登录成功',
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar_url,
        role: user.role,
        openid: user.openid
      }
    }
  });
}));

module.exports = router;
