const db = require('../config/db');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');

class AdminService {
  // ===================================
  // User Management
  // ===================================

  async getUserList(params) {
    const {
      page = 1,
      limit = 20,
      keyword = '',
      status = '',
      role = ''
    } = params;
    
    const offset = (page - 1) * limit;
    
    // Build query conditions
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
    
    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      queryParams
    );
    
    const total = countResult[0].total;
    
    // Get user list with stats
    const [users] = await db.query(
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
    
    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createUser(userData) {
    const { username, email, password, phone, nickname, role = 'user', avatar, bio, status = 1 } = userData;
    
    if (!username || !email || !password) {
      throw new ApiError(400, '用户名、邮箱和密码不能为空');
    }
    
    // Check if username exists
    const [existingUsername] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUsername.length > 0) {
      throw new ApiError(400, '用户名已存在');
    }
    
    // Check if email exists
    const [existingEmail] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingEmail.length > 0) {
      throw new ApiError(400, '邮箱已存在');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [result] = await db.query(
      `INSERT INTO users (username, email, password, phone, nickname, role, avatar, bio, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, phone, nickname, role, avatar, bio, status]
    );
    
    // Initialize user stats
    await db.query(
      `INSERT INTO user_stats (user_id, total_questions, correct_questions, correct_rate) 
       VALUES (?, 0, 0, 0)`,
      [result.insertId]
    );
    
    return { userId: result.insertId };
  }

  async updateUser(id, updateData) {
    const { username, email, phone, nickname, role, avatar, bio, status } = updateData;
    
    // Check if user exists
    const [existingUser] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      throw new ApiError(404, '用户不存在');
    }
    
    const updateFields = [];
    const updateValues = [];
    
    if (username !== undefined) {
      const [existingUsername] = await db.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, id]
      );
      
      if (existingUsername.length > 0) {
        throw new ApiError(400, '用户名已存在');
      }
      
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    
    if (email !== undefined) {
      const [existingEmail] = await db.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      
      if (existingEmail.length > 0) {
        throw new ApiError(400, '邮箱已存在');
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
      throw new ApiError(400, '没有要更新的字段');
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);
    
    await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    return true;
  }

  async deleteUser(id) {
    // Check if user exists
    const [existingUser] = await db.query(
      'SELECT id, role FROM users WHERE id = ?',
      [id]
    );
    
    if (existingUser.length === 0) {
      throw new ApiError(404, '用户不存在');
    }
    
    // Prevent deleting admin accounts
    if (existingUser[0].role === 'admin') {
      throw new ApiError(400, '不能删除管理员账户');
    }
    
    // Delete related data
    await db.query('DELETE FROM user_stats WHERE user_id = ?', [id]);
    await db.query('DELETE FROM user_answers WHERE user_id = ?', [id]);
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    return true;
  }

  async getUserById(id) {
    const [users] = await db.query(
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
      throw new ApiError(404, '用户不存在');
    }

    return users[0];
  }

  async getUserStats(id) {
    // Get user and stats info
    const [users] = await db.query(
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
      throw new ApiError(404, '用户不存在');
    }
    
    // Get recent activities
    const [recentActivities] = await db.query(
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
    
    return {
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
      recentActivities: recentActivities.map(item => ({
        ...item, 
        result: item.isCorrect ? '正确' : '错误'
      }))
    };
  }

  async updateUserStatus(id, status) {
    const [result] = await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      throw new ApiError(404, '用户不存在');
    }
    return { id, status };
  }

  // ===================================
  // Dashboard Statistics
  // ===================================

  async getDashboardStats() {
    const [
      [{ userCount }],
      [{ questionCount }],
      [{ articleCount }],
      [{ knowledgeCount }],
      [{ todaySignups }]
    ] = await Promise.all([
      db.query('SELECT COUNT(*) as userCount FROM users'),
      db.query('SELECT COUNT(*) as questionCount FROM questions'),
      db.query('SELECT COUNT(*) as articleCount FROM articles'),
      db.query('SELECT COUNT(*) as knowledgeCount FROM knowledge_points'),
      db.query('SELECT COUNT(*) as todaySignups FROM users WHERE DATE(created_at) = CURDATE()')
    ]);

    return {
      userCount,
      questionCount,
      articleCount,
      knowledgeCount,
      todaySignups
    };
  }

  async getSystemStats() {
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
    const [questionCount] = await db.query('SELECT COUNT(*) as count FROM questions');
    const [categoryCount] = await db.query('SELECT COUNT(*) as count FROM question_categories');
    const [answerCount] = await db.query('SELECT COUNT(*) as count FROM user_answer_log');
    
    return {
      userCount: userCount[0].count,
      questionCount: questionCount[0].count,
      categoryCount: categoryCount[0].count,
      answerCount: answerCount[0].count
    };
  }

  async getRecentActivities() {
    const [activities] = await db.query(`
      SELECT 
        'user' as type,
        username as title,
        CONCAT('用户 ', username, ' 注册了账号') as content,
        created_at as time
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      UNION ALL
      
      SELECT 
        'question' as type,
        title as title,
        CONCAT('管理员添加了新题目《', title, '》') as content,
        created_at as time
      FROM questions 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      UNION ALL
      
      SELECT 
        'answer' as type,
        '答题记录' as title,
        CONCAT('用户完成了一次答题') as content,
        created_at as time
      FROM user_answer_log 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      ORDER BY time DESC 
      LIMIT 10
    `);
    
    return activities.map(activity => ({
      id: Math.random().toString(36).substr(2, 9),
      content: activity.content,
      time: activity.time
    }));
  }

  async getUserGrowthData() {
    const [growthData] = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    
    // Generate labels for the last 6 months
    const months = [];
    const monthData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = `${date.getMonth() + 1}月`;
      months.push(monthStr);
      
      // Calculate total users for this month
      const monthUsers = growthData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === date.getFullYear();
      });
      
      monthData.push(monthUsers.reduce((sum, item) => sum + item.count, 0));
    }
    
    return { months, data: monthData };
  }

  async getCategoryDistribution() {
    const [categoryData] = await db.query(`
      SELECT 
        qc.name as category,
        COUNT(q.id) as count
      FROM question_categories qc
      LEFT JOIN questions q ON qc.id = q.category_id
      GROUP BY qc.id, qc.name
      ORDER BY count DESC
    `);
    
    return categoryData.map(item => ({
      name: item.category,
      value: item.count
    }));
  }

  // ===================================
  // Permission Management
  // ===================================

  async verifyAdminPermission(userId) {
    const [users] = await db.query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0 || users[0].role !== 'admin') {
      throw new ApiError(403, '需要管理员权限');
    }
    
    return true;
  }
}

module.exports = new AdminService();