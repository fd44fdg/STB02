const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const db = require('../config/db');
const config = require('../config');
const ApiError = require('../utils/ApiError');

class AuthService {
  async register(userData) {
    const { username, email, password, nickname } = userData;
    
    if (!username || !email || !password) {
      throw new ApiError(400, '用户名、邮箱和密码为必填项');
    }
    
    const existingUser = await db('users').where({ username }).first();
    if (existingUser) {
      throw new ApiError(400, '用户名已被使用');
    }
    
    const existingEmail = await db('users').where({ email }).first();
    if (existingEmail) {
      throw new ApiError(400, '邮箱已被注册');
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [id] = await db('users').insert({
      username,
      email,
      password_hash: hashedPassword,
      nickname: nickname || username,
      role: 'user',
      status: 1
    });
    
    const user = await db('users').where({ id }).first();
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn || '24h' }
    );
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        role: user.role
      }
    };
  }

  async login(credentials) {
    const { username, password } = credentials;
    
    if (!username || !password) {
      throw new ApiError(400, '请输入用户名和密码');
    }
    
    const user = await db('users').where({ username }).first();
    if (!user) {
      throw new ApiError(401, '用户名或密码错误');
    }
    
    if (user.status !== 1) {
      throw new ApiError(401, '账户已被禁用');
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new ApiError(401, '用户名或密码错误');
    }
    
    await db('users').where({ id: user.id }).update({ last_login: db.fn.now() });
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn || '24h' }
    );
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        role: user.role
      }
    };
  }

  async wechatLogin(code) {
    if (!code) {
      throw new ApiError(400, '缺少微信授权码');
    }
    
    const appId = process.env.WECHAT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;
    
    if (!appId || !appSecret) {
      throw new ApiError(500, '微信小程序配置缺失');
    }
    
    try {
      const response = await axios.get(`https://api.weixin.qq.com/sns/jscode2session`, {
        params: {
          appid: appId,
          secret: appSecret,
          js_code: code,
          grant_type: 'authorization_code'
        }
      });
      
      const { openid, session_key, errcode, errmsg } = response.data;
      
      if (errcode) {
        throw new ApiError(400, `微信登录失败: ${errmsg}`);
      }
      
      let user = await db('users').where({ wechat_openid: openid }).first();
      
      if (!user) {
        const [id] = await db('users').insert({
          username: `wx_${openid.slice(-8)}`,
          wechat_openid: openid,
          nickname: `微信用户${openid.slice(-4)}`,
          role: 'user',
          status: 1
        });
        
        user = await db('users').where({ id }).first();
      }
      
      await db('users').where({ id: user.id }).update({ last_login: db.fn.now() });
      
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn || '24h' }
      );
      
      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          role: user.role
        }
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, '微信登录服务异常');
    }
  }

  async changePassword(userId, passwords) {
    const { oldPassword, newPassword } = passwords;
    
    if (!oldPassword || !newPassword) {
      throw new ApiError(400, '请提供旧密码和新密码');
    }
    
    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      throw new ApiError(404, '用户不存在');
    }
    
    const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValidPassword) {
      throw new ApiError(401, '旧密码错误');
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await db('users').where({ id: userId }).update({ password_hash: hashedPassword });
    return null;
  }
}

module.exports = new AuthService();