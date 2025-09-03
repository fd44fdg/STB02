const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiError = require('../utils/ApiError');

/**
 * 验证JWT令牌
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const verifyToken = (req, res, next) => {
  try {
    // 从请求头获取token
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, '未提供认证令牌'));
  }

    // 提取token
  const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next(new ApiError(401, '无效的认证令牌格式'));
    }
    
    // 验证token（优先严格校验 iss/aud），兼容旧令牌：若仅因 iss/aud 失败则降级校验一次
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret, {
        algorithms: [config.jwt.algorithm || 'HS256'],
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      });
    } catch (e) {
      if (e && (e.name === 'JsonWebTokenError') && /issuer|audience/i.test(e.message)) {
        // 兼容旧令牌（无 iss/aud），打印警告，后续可移除此分支
        decoded = jwt.verify(token, config.jwt.secret);
      } else {
        throw e;
      }
    }

    // 将用户信息添加到请求对象（统一使用 id，并兼容 userId）
    req.user = decoded || {};
    if (req.user && typeof req.user.id !== 'undefined') {
      // 向后兼容：部分旧代码读取 userId
      req.user.userId = req.user.id;
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, '认证令牌已过期'));
    } else if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, '无效的认证令牌'));
    } else {
      return next(new ApiError(500, '认证处理失败'));
    }
  }
};

/**
 * 检查用户是否为管理员
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new ApiError(403, '需要管理员权限'));
  }
};

/**
 * 检查用户是否有特定权限
 * @param {string[]} permissions - 所需权限列表
 * @returns {Function} 中间件函数
 */
const hasPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, '未认证用户'));
    }
    
    // 管理员拥有所有权限
    if (req.user.role === 'admin') {
      return next();
    }
    
    // 检查用户是否有所需权限
    const userPermissions = req.user.permissions || [];
    const hasRequiredPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );
    
    if (hasRequiredPermission) {
      next();
    } else {
      next(new ApiError(403, '没有足够的权限'));
    }
  };
};

/**
 * 检查用户是否是资源所有者
 * @param {Function} getOwnerId - 从请求中获取资源所有者ID的函数
 * @returns {Function} 中间件函数
 */
const isResourceOwner = (getOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, '未认证用户'));
      }
      
      // 管理员可以访问任何资源
      if (req.user.role === 'admin') {
        return next();
      }
      
      // 获取资源所有者ID
      const ownerId = await getOwnerId(req);
      
      // 检查当前用户是否是资源所有者
      if (req.user.id === ownerId) {
        next();
      } else {
        next(new ApiError(403, '没有权限访问此资源'));
      }
    } catch (error) {
      next(new ApiError(500, '权限验证失败'));
    }
  };
};

/**
 * 可选的Token验证
 * 如果提供了有效的token，则解析并添加用户信息到请求
 * 如果没有提供token或token无效，则继续处理请求
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    // Token验证失败，但不阻止请求继续处理
    req.user = null;
    next();
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  hasPermission,
  isResourceOwner,
  optionalAuth
};
