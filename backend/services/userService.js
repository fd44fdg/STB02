const bcrypt = require('bcryptjs');
const db = require('../config/db');
const ApiError = require('../utils/ApiError');

class UserService {
  async getUserProfile(userId) {
    const users = await db.query(
      `SELECT 
         id, username, email, nickname, avatar, gender, birthday, bio, 
         learning_goal AS learningGoal, 
         level, points, 
         created_at AS createdAt 
       FROM users WHERE id = ?`,
      [userId]
    );
    
    if (!users[0] || users[0].length === 0) {
      throw new ApiError(404, '用户不存在');
    }
    
    return users[0][0];
  }

  async updateProfile(userId, profileData) {
    const { nickname, avatar, gender, birthday, bio, learning_goal } = profileData;
    
    const updateFields = [];
    const updateValues = [];
    
    if (nickname !== undefined) {
      updateFields.push('nickname = ?');
      updateValues.push(nickname);
    }
    
    if (avatar !== undefined) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }
    
    if (gender !== undefined) {
      updateFields.push('gender = ?');
      updateValues.push(gender);
    }
    
    if (birthday !== undefined) {
      updateFields.push('birthday = ?');
      updateValues.push(birthday);
    }
    
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(bio);
    }
    
    if (learning_goal !== undefined) {
      updateFields.push('learning_goal = ?');
      updateValues.push(learning_goal);
    }
    
    if (updateFields.length === 0) {
      throw new ApiError(400, '没有要更新的字段');
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);
    
    await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    return await this.getUserProfile(userId);
  }

  async changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, '当前密码和新密码不能为空');
    }
    
    if (newPassword.length < 6) {
      throw new ApiError(400, '新密码长度至少6个字符');
    }
    
    const users = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );
    
    if (!users[0] || users[0].length === 0) {
      throw new ApiError(404, '用户不存在');
    }
    
    const isValidPassword = await bcrypt.compare(currentPassword, users[0][0].password);
    if (!isValidPassword) {
      throw new ApiError(400, '当前密码错误');
    }
    
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    await db.query(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedNewPassword, userId]
    );
    
    return null;
  }

  async updateAvatar(userId, avatarUrl) {
    await db.query(
      'UPDATE users SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [avatarUrl, userId]
    );
    
    return { url: avatarUrl };
  }

  async getUserStats(userId) {
    const stats = await db.query(
      `SELECT 
         s.correct_rate AS correctRate, 
         s.continuous_days AS continuousDays, 
         s.total_questions AS totalQuestions, 
         s.correct_questions AS correctQuestions, 
         s.rank_position AS rank,
         u.points
       FROM user_stats s
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = ?`,
      [userId]
    );
    
    let userStats = stats[0] && stats[0][0];

    if (!userStats) {
      await db.query(
        `INSERT INTO user_stats (user_id, correct_rate, continuous_days, total_questions, correct_questions, rank_position) 
         VALUES (?, 0.00, 0, 0, 0, 0)`,
        [userId]
      );
      
      userStats = { correctRate: 0, continuousDays: 0, totalQuestions: 0, correctQuestions: 0, rank: 0, points: 0 };
    } else {
      userStats.correctRate = parseFloat(userStats.correctRate);
    }

    return userStats;
  }

  async getCheckinStatus(userId) {
    const today = new Date().toISOString().split('T')[0];
    
    const todayCheckin = await db.query(
      'SELECT id FROM user_checkins WHERE user_id = ? AND checkin_date = ?',
      [userId, today]
    );
    
    const totalDays = await db.query(
      'SELECT COUNT(*) as total_days FROM user_checkins WHERE user_id = ?',
      [userId]
    );
    
    let continuousDays;
    if (db.isUsingSqlite) {
      continuousDays = totalDays;
    } else {
      continuousDays = await db.query(
        `SELECT COUNT(*) as continuous_days 
         FROM (
           SELECT checkin_date,
                  ROW_NUMBER() OVER (ORDER BY checkin_date DESC) as rn,
                  DATE_SUB(checkin_date, INTERVAL ROW_NUMBER() OVER (ORDER BY checkin_date DESC) DAY) as grp
           FROM user_checkins 
           WHERE user_id = ? 
           ORDER BY checkin_date DESC
         ) t 
         WHERE grp = (SELECT DATE_SUB(MAX(checkin_date), INTERVAL ROW_NUMBER() OVER (ORDER BY MAX(checkin_date) DESC) DAY) 
                      FROM user_checkins WHERE user_id = ? LIMIT 1)`,
        [userId, userId]
      );
    }
    
    const checkInStatus = {
      isCheckedIn: todayCheckin[0] && todayCheckin[0].length > 0,
      checkInDays: (totalDays[0] && totalDays[0][0] && totalDays[0][0].total_days) || 0,
      continuousCheckInDays: (continuousDays[0] && continuousDays[0][0] && continuousDays[0][0].continuous_days) || 
                            (totalDays[0] && totalDays[0][0] && totalDays[0][0].total_days) || 0
    };
    
    return checkInStatus;
  }

  async performCheckin(userId) {
    const today = new Date().toISOString().split('T')[0];
    
    if (db.isUsingSqlite) {
      const existingCheckin = await db.query(
        'SELECT id FROM user_checkins WHERE user_id = ? AND checkin_date = ?',
        [userId, today]
      );
      
      if (existingCheckin[0] && existingCheckin[0].length > 0) {
        throw new ApiError(400, '今天已经签到过了');
      }
      
      await db.query(
        'INSERT INTO user_checkins (user_id, checkin_date) VALUES (?, ?)',
        [userId, today]
      );
      
      const pointsReward = 5;
      await db.query(
        'UPDATE users SET points = points + ? WHERE id = ?',
        [pointsReward, userId]
      );
      
      const totalDays = await db.query(
        'SELECT COUNT(*) as total_days FROM user_checkins WHERE user_id = ?',
        [userId]
      );
      
      return {
        isCheckedIn: true,
        checkInDays: totalDays[0][0].total_days,
        continuousCheckInDays: totalDays[0][0].total_days,
        pointsEarned: pointsReward
      };
    } else {
      const trx = await db.transaction();
      
      try {
        const existingCheckin = await trx.raw(
          'SELECT id FROM user_checkins WHERE user_id = ? AND checkin_date = ?',
          [userId, today]
        );
        
        if (existingCheckin[0] && existingCheckin[0].length > 0) {
          throw new ApiError(400, '今天已经签到过了');
        }
        
        await trx('user_checkins').insert({
          user_id: userId,
          checkin_date: today
        });
        
        const pointsReward = 5;
        await trx('users')
          .where('id', userId)
          .increment('points', pointsReward);
        
        const totalDaysResult = await trx('user_checkins')
          .count('* as total_days')
          .where('user_id', userId);
        
        const continuousDaysResult = await trx.raw(
          `SELECT COUNT(*) as continuous_days 
           FROM (
             SELECT checkin_date,
                    ROW_NUMBER() OVER (ORDER BY checkin_date DESC) as rn,
                    DATE_SUB(checkin_date, INTERVAL ROW_NUMBER() OVER (ORDER BY checkin_date DESC) DAY) as grp
             FROM user_checkins 
             WHERE user_id = ? 
             ORDER BY checkin_date DESC
           ) t 
           WHERE grp = (SELECT DATE_SUB(MAX(checkin_date), INTERVAL ROW_NUMBER() OVER (ORDER BY MAX(checkin_date) DESC) DAY) 
                        FROM user_checkins WHERE user_id = ? LIMIT 1)`,
          [userId, userId]
        );
        
        await trx.commit();
        
        return {
          isCheckedIn: true,
          checkInDays: totalDaysResult[0].total_days,
          continuousCheckInDays: continuousDaysResult[0][0].continuous_days,
          pointsEarned: pointsReward
        };
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    }
  }

  async updateUserStats(userId, isCorrect, questionId) {
    if (db.isUsingSqlite) {
      await db.query(
        `INSERT INTO user_answers (user_id, question_id, is_correct) 
         VALUES (?, ?, ?)`,
        [userId, questionId, isCorrect]
      );
      
      const statsResult = await db.query(
        'SELECT total_questions, correct_questions FROM user_stats WHERE user_id = ?',
        [userId]
      );
      
      let { total_questions, correct_questions } = (statsResult[0] && statsResult[0][0]) || 
        { total_questions: 0, correct_questions: 0 };

      total_questions += 1;
      if (isCorrect) {
        correct_questions += 1;
      }
      const newCorrectRate = total_questions > 0 ? (correct_questions / total_questions) : 0;
        
      await db.query(
        `UPDATE user_stats 
         SET total_questions = ?, correct_questions = ?, correct_rate = ?
           WHERE user_id = ?`,
        [total_questions, correct_questions, newCorrectRate, userId]
      );
        
      if (isCorrect) {
        const pointsToAdd = 10;
        await db.query(
          'UPDATE users SET points = points + ? WHERE id = ?',
          [pointsToAdd, userId]
        );
      }
    } else {
      const trx = await db.transaction();
      
      try {
        await trx('user_answers').insert({
          user_id: userId,
          question_id: questionId,
          is_correct: isCorrect
        });
        
        const statsResult = await trx('user_stats')
          .select('total_questions', 'correct_questions')
          .where('user_id', userId)
          .first();
        
        let { total_questions, correct_questions } = statsResult;

        total_questions += 1;
        if (isCorrect) {
          correct_questions += 1;
        }
        const newCorrectRate = total_questions > 0 ? (correct_questions / total_questions) : 0;
          
        await trx('user_stats')
          .where('user_id', userId)
          .update({
            total_questions,
            correct_questions,
            correct_rate: newCorrectRate
          });
          
        if (isCorrect) {
          const pointsToAdd = 10;
          await trx('users')
            .where('id', userId)
            .increment('points', pointsToAdd);
        }

        await trx.commit();
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    }
    
    return null;
  }

  async getUserList(params) {
    const { name, page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const queryParams = [];
    
    if (name) {
      whereClause = ' WHERE username LIKE ? OR nickname LIKE ? OR email LIKE ?';
      const searchTerm = `%${name}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const usersQuery = `SELECT id, username, email, nickname, avatar, gender, birthday, bio, 
                        learning_goal AS learningGoal, level, points, role, status, 
                        created_at AS createdAt, updated_at AS updatedAt 
                        FROM users${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    
    const countQuery = `SELECT COUNT(*) as total FROM users${whereClause}`;
    
    const [users] = await db.query(usersQuery, [...queryParams, parseInt(limit), offset]);
    const [countResult] = await db.query(countQuery, queryParams);
    
    return {
      total: countResult[0].total,
      items: users
    };
  }

  async createUser(userData) {
    const { username, password, email, role } = userData;
    
    if (!username || !password) {
      throw new ApiError(400, '用户名和密码是必填项');
    }

    const [existingUsers] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      throw new ApiError(409, '用户名已存在');
    }

    if (email) {
      const [existingEmails] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existingEmails.length > 0) {
        throw new ApiError(409, '邮箱已存在');
      }
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await db.query(
      `INSERT INTO users (username, password, email, role, avatar, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, email || '', role || 'user', '/default-avatar.svg', 1]
    );

    const [newUsers] = await db.query(
      `SELECT id, username, email, nickname, avatar, gender, birthday, bio, 
       learning_goal AS learningGoal, level, points, role, status, 
       created_at AS createdAt, updated_at AS updatedAt 
       FROM users WHERE id = ?`,
      [result.insertId]
    );

    await db.query(
      `INSERT INTO user_stats (user_id, correct_rate, continuous_days, total_questions, correct_questions, rank_position) 
       VALUES (?, 0.00, 0, 0, 0, 0)`,
      [result.insertId]
    );

    return newUsers[0];
  }

  async updateUser(userIdToUpdate, updateData, currentUserId, currentUserRole) {
    const { username, email, role } = updateData;

    if (currentUserRole !== 'admin' && currentUserId !== userIdToUpdate) {
      throw new ApiError(403, '无权访问');
    }

    const [existingUsers] = await db.query('SELECT id FROM users WHERE id = ?', [userIdToUpdate]);
    if (existingUsers.length === 0) {
      throw new ApiError(404, '用户不存在');
    }

    const updateFields = [];
    const updateValues = [];

    if (username !== undefined) {
      const [usernameCheck] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, userIdToUpdate]);
      if (usernameCheck.length > 0) {
        throw new ApiError(409, '用户名已存在');
      }
      updateFields.push('username = ?');
      updateValues.push(username);
    }

    if (email !== undefined) {
      const [emailCheck] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userIdToUpdate]);
      if (emailCheck.length > 0) {
        throw new ApiError(409, '邮箱已存在');
      }
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }

    if (updateFields.length === 0) {
      throw new ApiError(400, '没有要更新的字段');
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userIdToUpdate);

    await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    const [updatedUsers] = await db.query(
      `SELECT id, username, email, nickname, avatar, gender, birthday, bio, 
       learning_goal AS learningGoal, level, points, role, status, 
       created_at AS createdAt, updated_at AS updatedAt 
       FROM users WHERE id = ?`,
      [userIdToUpdate]
    );

    return updatedUsers[0];
  }

  async deleteUser(userIdToDelete, currentUserId, currentUserRole) {
    if (currentUserRole !== 'admin') {
      throw new ApiError(403, '无权访问');
    }

    const [existingUsers] = await db.query('SELECT id, role FROM users WHERE id = ?', [userIdToDelete]);
    if (existingUsers.length === 0) {
      throw new ApiError(404, '用户不存在');
    }

    if (userIdToDelete === currentUserId) {
      throw new ApiError(400, '不能删除当前登录的管理员账户');
    }

    if (db.isUsingSqlite) {
      await db.query('DELETE FROM user_stats WHERE user_id = ?', [userIdToDelete]);
      await db.query('DELETE FROM user_checkins WHERE user_id = ?', [userIdToDelete]);
      await db.query('DELETE FROM user_answers WHERE user_id = ?', [userIdToDelete]);
      await db.query('DELETE FROM user_favorites WHERE user_id = ?', [userIdToDelete]);
      await db.query('DELETE FROM user_wrong_questions WHERE user_id = ?', [userIdToDelete]);
      
      try {
        await db.query('DELETE FROM user_article_likes WHERE user_id = ?', [userIdToDelete]);
        await db.query('DELETE FROM user_article_favorites WHERE user_id = ?', [userIdToDelete]);
        await db.query('DELETE FROM article_comments WHERE user_id = ?', [userIdToDelete]);
      } catch (e) {
        // Ignore table not exists errors
      }
      
      await db.query('DELETE FROM users WHERE id = ?', [userIdToDelete]);
    } else {
      const trx = await db.transaction();
      
      try {
        await trx('user_stats').where('user_id', userIdToDelete).del();
        await trx('user_checkins').where('user_id', userIdToDelete).del();
        await trx('user_answers').where('user_id', userIdToDelete).del();
        await trx('user_favorites').where('user_id', userIdToDelete).del();
        await trx('user_wrong_questions').where('user_id', userIdToDelete).del();
        await trx('user_article_likes').where('user_id', userIdToDelete).del();
        await trx('user_article_favorites').where('user_id', userIdToDelete).del();
        await trx('article_comments').where('user_id', userIdToDelete).del();
        await trx('users').where('id', userIdToDelete).del();

        await trx.commit();
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    }
    
    return null;
  }
}

module.exports = new UserService();