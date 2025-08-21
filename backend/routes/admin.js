const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { verifyToken: authMiddleware } = require('../middleware/auth');
const { sendSuccess } = require('../utils/responseHandler');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

// 管理员权限验证中间件
const requireAdmin = async (req, res, next) => {
  try {
    const [users] = await pool.execute(
      'SELECT role FROM users WHERE id = ?',
      [req.user.userId]
    );
    
    if (users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '需要管理员权限'
      });
    }
    
    next();
  } catch (error) {
    console.error('权限验证错误:', error);
    res.status(500).json({
      success: false,
      message: '权限验证失败'
    });
  }
};

// 获取用户列表（管理员）
router.get('/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      keyword = '',
      status = '',
      role = ''
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // 构建查询条件
    let whereConditions = [];
    let queryParams = [];
    
    if (keyword) {
      whereConditions.push('(username LIKE ? OR email LIKE ? OR phone LIKE ?)');
      queryParams.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    
    if (status !== '') {
      whereConditions.push('status = ?');
      queryParams.push(parseInt(status));
    }
    
    if (role) {
      whereConditions.push('role = ?');
      queryParams.push(role);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // 获取总数
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      queryParams
    );
    
    const total = countResult[0].total;
    
    // 获取用户列表 (已优化 N+1 查询问题, 并使用驼峰命名)
    const [users] = await pool.execute(
      `SELECT 
         u.id, u.username, u.email, u.phone, u.nickname, u.role, u.avatar, u.bio, u.status, u.points, u.level,
         u.created_at AS createdAt, 
         u.updated_at AS updatedAt,
         us.total_questions AS totalQuestions, 
         us.correct_questions AS correctQuestions, 
         us.correct_rate AS accuracy
       FROM users u
       LEFT JOIN user_stats us ON u.id = us.user_id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), parseInt(offset)]
    );
    
    res.json({
      success: true,
      data: {
        users: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
});

// 创建用户（管理员）
router.post('/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { username, email, password, phone, nickname, role = 'user', avatar, bio, status = 1 } = req.body;
    
    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码不能为空'
      });
    }
    
    // 检查用户名是否已存在
    const [existingUsername] = await pool.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUsername.length > 0) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }
    
    // 检查邮箱是否已存在
    const [existingEmail] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: '邮箱已存在'
      });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const [result] = await pool.execute(
      `INSERT INTO users (username, email, password, phone, nickname, role, avatar, bio, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, phone, nickname, role, avatar, bio, status]
    );
    
    // 初始化用户统计
    await pool.execute(
      `INSERT INTO user_stats (user_id, total_questions, correct_questions, correct_rate) 
       VALUES (?, 0, 0, 0)`,
      [result.insertId]
    );
    
    res.json({
      success: true,
      message: '用户创建成功',
      data: {
        userId: result.insertId
      }
    });
    
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({
      success: false,
      message: '创建用户失败'
    });
  }
});

// 更新用户（管理员）
router.put('/users/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone, nickname, role, avatar, bio, status } = req.body;
    
    // 检查用户是否存在
    const [existingUser] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 构建更新字段
    const updateFields = [];
    const updateValues = [];
    
    if (username !== undefined) {
      // 检查用户名是否已被其他用户使用
      const [existingUsername] = await pool.execute(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, id]
      );
      
      if (existingUsername.length > 0) {
        return res.status(400).json({
          success: false,
          message: '用户名已存在'
        });
      }
      
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    
    if (email !== undefined) {
      // 检查邮箱是否已被其他用户使用
      const [existingEmail] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      
      if (existingEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: '邮箱已存在'
        });
      }
      
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    
    if (nickname !== undefined) {
      updateFields.push('nickname = ?');
      updateValues.push(nickname);
    }
    
    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    
    if (avatar !== undefined) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }
    
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(bio);
    }
    
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有要更新的字段'
      });
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);
    
    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    res.json({
      success: true,
      message: '用户更新成功'
    });
    
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({
      success: false,
      message: '更新用户失败'
    });
  }
});

// 删除用户（管理员）
router.delete('/users/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查用户是否存在
    const [existingUser] = await pool.execute(
      'SELECT id, role FROM users WHERE id = ?',
      [id]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 防止删除管理员账户
    if (existingUser[0].role === 'admin') {
      return res.status(400).json({
        success: false,
        message: '不能删除管理员账户'
      });
    }
    
    // 删除相关数据
    await pool.execute('DELETE FROM user_stats WHERE user_id = ?', [id]);
    await pool.execute('DELETE FROM user_answers WHERE user_id = ?', [id]);
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    
    res.status(200).json({ success: true, message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ success: false, message: '删除用户失败' });
  }
});

// 获取用户统计信息（管理员）
router.get('/users/:id/stats', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 一次性获取用户和统计信息
    const [users] = await pool.execute(
      `SELECT 
         u.username, u.email, u.created_at AS createdAt,
         s.total_questions AS totalQuestions,
         s.correct_questions AS correctQuestions,
         s.correct_rate AS accuracy,
         s.study_days AS studyDays
       FROM users u
       LEFT JOIN user_stats s ON u.id = s.user_id
       WHERE u.id = ?`,
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    // 获取最近答题记录
    const [recentActivities] = await pool.execute(
      `SELECT 
         q.title AS activity, 
         ua.is_correct AS isCorrect,
         ua.answered_at AS date
       FROM user_answers ua
       JOIN questions q ON ua.question_id = q.id
       WHERE ua.user_id = ?
       ORDER BY ua.answered_at DESC
       LIMIT 10`,
      [id]
    );
    
    res.json({
      success: true,
      data: {
        user: {
          username: users[0].username,
          email: users[0].email,
          createdAt: users[0].createdAt
        },
        stats: {
          totalQuestions: users[0].totalQuestions || 0,
          correctQuestions: users[0].correctQuestions || 0,
          accuracy: users[0].accuracy || 0,
          studyDays: users[0].studyDays || 0
        },
        recentActivities: recentActivities.map(item => ({...item, result: item.isCorrect ? '正确' : '错误'}))
      }
    });
    
  } catch (error) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({ success: false, message: '获取用户统计失败' });
  }
});

// 获取单个用户信息（管理员）
router.get('/users/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.execute(
      `SELECT 
        u.id, u.username, u.email, u.phone, u.nickname, u.role, u.avatar, u.bio, u.status, u.points, u.level,
        u.created_at AS createdAt, 
        u.updated_at AS updatedAt,
        us.total_questions AS totalQuestions, 
        us.correct_questions AS correctQuestions, 
        us.correct_rate AS accuracy,
        us.continuous_days AS continuousDays,
        us.last_login_at AS lastLoginAt
      FROM users u
      LEFT JOIN user_stats us ON u.id = us.user_id
      WHERE u.id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
      success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('获取单个用户错误:', error);
    res.status(500).json({ success: false, message: '获取单个用户失败' });
  }
});

// Middleware to check for admin role
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    throw new ApiError(403, '无权访问，需要管理员权限');
};

// All routes in this file are protected by auth and admin middleware
router.use(authMiddleware, adminOnly);

// --- Dashboard Stats ---
router.get('/dashboard/stats', catchAsync(async (req, res) => {
    const [
        [{ userCount }],
        [{ questionCount }],
        [{ articleCount }],
        [{ knowledgeCount }],
        [{ todaySignups }]
    ] = await Promise.all([
        pool.execute('SELECT COUNT(*) as userCount FROM users'),
        pool.execute('SELECT COUNT(*) as questionCount FROM questions'),
        pool.execute('SELECT COUNT(*) as articleCount FROM articles'),
        pool.execute('SELECT COUNT(*) as knowledgeCount FROM knowledge_points'),
        pool.execute('SELECT COUNT(*) as todaySignups FROM users WHERE DATE(created_at) = CURDATE()')
    ]);

    const stats = {
        userCount,
        questionCount,
        articleCount,
        knowledgeCount,
        todaySignups
    };

    sendSuccess(res, stats);
}));

// --- User Management ---
router.get('/users', catchAsync(async (req, res) => {
    const { page = 1, limit = 10, keyword } = req.query;
    const offset = (page - 1) * limit;

    let usersQuery = 'SELECT id, username, email, role, created_at, status FROM users';
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    const params = [];

    if (keyword) {
        usersQuery += ' WHERE username LIKE ? OR email LIKE ?';
        countQuery += ' WHERE username LIKE ? OR email LIKE ?';
        params.push(`%${keyword}%`, `%${keyword}%`);
    }

    usersQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const usersParams = [...params, parseInt(limit), parseInt(offset)];
    
    const [users] = await pool.execute(usersQuery, usersParams);
    const [[{ total }]] = await pool.execute(countQuery, params);

    sendSuccess(res, { items: users, total });
}));

router.put('/users/:id/status', catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (status === undefined) throw new ApiError(400, '缺少status参数');

    const [result] = await pool.execute('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) throw new ApiError(404, '用户不存在');

    sendSuccess(res, { id, status }, '用户状态更新成功');
}));

// Note: Other admin-specific endpoints for managing content (articles, questions, etc.)
// would follow the same pattern:
// 1. Use authMiddleware and adminOnly middleware.
// 2. Use `catchAsync` for the handler.
// 3. Perform database operations using `pool`.
// 4. Use `sendSuccess` or `throw new ApiError` for responses.

module.exports = router;