const express = require('express');
const router = express.Router();
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { verifyToken } = require('../middleware/auth');
const ApiError = require('../utils/ApiError');
const path = require('path');

async function getDb() {
  return open({
    filename: path.join(__dirname, '../database/local.db'),
    driver: sqlite3.Database
  });
}

// POST /api/v1/checkin - 用户签到
router.post('/checkin', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const db = await getDb();

    // 检查今天是否已经签到
    const existingCheckIn = await db.get('SELECT * FROM check_ins WHERE user_id = ? AND check_in_date = ?', [userId, today]);
    if (existingCheckIn) {
      return next(new ApiError(400, '今日已签到，请勿重复操作'));
    }

    // 获取用户信息
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return next(new ApiError(404, '用户不存在'));
    }

    let continuousDays = user.continuous_check_in_days || 0;
    const lastCheckInDate = user.last_check_in_date;

    if (lastCheckInDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      if (lastCheckInDate === yesterdayString) {
        continuousDays++;
      } else {
        continuousDays = 1;
      }
    } else {
      continuousDays = 1;
    }

    // 更新用户信息和插入签到记录
    await db.run('BEGIN TRANSACTION');
    await db.run('UPDATE users SET continuous_check_in_days = ?, last_check_in_date = ? WHERE id = ?', [continuousDays, today, userId]);
    await db.run('INSERT INTO check_ins (user_id, check_in_date) VALUES (?, ?)', [userId, today]);
    await db.run('COMMIT');

    await db.close();

    sendSuccess(res, { continuousDays }, '签到成功');

  } catch (error) {
    next(new ApiError(500, '签到失败', false, error.stack));
  }
});

// GET /api/v1/checkin/status - 获取用户签到状态
router.get('/checkin/status', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const db = await getDb();

    const user = await db.get('SELECT continuous_check_in_days, last_check_in_date FROM users WHERE id = ?', [userId]);

    if (!user) {
      return next(new ApiError(404, '用户不存在'));
    }

    const today = new Date().toISOString().split('T')[0];
    const isCheckedInToday = user.last_check_in_date === today;

    await db.close();

    sendSuccess(res, {
      isCheckedIn: isCheckedInToday,
      continuousDays: user.continuous_check_in_days || 0
    });

  } catch (error) {
    next(new ApiError(500, '获取签到状态失败', false, error.stack));
  }
});

module.exports = router;
