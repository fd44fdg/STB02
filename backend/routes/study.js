const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const config = require('../config');
const { verifyToken: authMiddleware } = require('../middleware/auth');
const { sendSuccess } = require('../utils/responseHandler');
const ApiError = require('../utils/ApiError');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// ===== Favorites =====

/**
 * @api {get} /api/v1/study/favorites 获取用户收藏的题目列表
 * @apiDescription 获取当前用户收藏的所有题目
 * @apiName GetFavorites
 * @apiGroup Study
 * @apiParam {Number} [page=1] 页码
 * @apiParam {Number} [limit=10] 每页数量
 * @apiParam {String} [category] 可选的分类筛选
 * @apiParam {String} [difficulty] 可选的难度筛选
 */
router.get('/favorites', authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10, category, difficulty } = req.query;
    // Note: Filtering logic would be more complex in a real app
    const questions = await db.query(`
        SELECT q.* FROM questions q
        JOIN user_favorites uf ON q.id = uf.question_id
        WHERE uf.user_id = ?
        ORDER BY uf.created_at DESC
        LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), (page - 1) * limit]);

    const totalResult = await db.query('SELECT COUNT(*) as total FROM user_favorites WHERE user_id = ?', [userId]);
    sendSuccess(res, { items: questions, total });
}));

/**
 * @api {post} /api/v1/study/favorites/:questionId 添加收藏
 * @apiDescription 将题目添加到收藏夹
 * @apiName AddFavorite
 * @apiGroup Study
 * @apiParam {Number} questionId 题目ID
 */
router.post('/favorites/:questionId', authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { questionId } = req.params;

    const questionResult = await db.query('SELECT id FROM questions WHERE id = ?', [questionId]);
    if (!questionResult || questionResult.length === 0) throw new ApiError(404, '题目不存在');

    const favoriteResult = await db.query('SELECT * FROM user_favorites WHERE user_id = ? AND question_id = ?', [userId, questionId]);
    if (favoriteResult && favoriteResult.length > 0) {
        return sendSuccess(res, { favorited: true }, '题目已在收藏夹中');
    }
    await db.query('INSERT INTO user_favorites (user_id, question_id) VALUES (?, ?)', [userId, questionId]);
    sendSuccess(res, { favorited: true }, '收藏成功', 201);
}));

/**
 * @api {delete} /api/v1/study/favorites/:questionId 取消收藏
 * @apiDescription 从收藏夹中移除题目
 * @apiName RemoveFavorite
 * @apiGroup Study
 * @apiParam {Number} questionId 题目ID
 */
router.delete('/favorites/:questionId', authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { questionId } = req.params;
    const result = await db.query('DELETE FROM user_favorites WHERE user_id = ? AND question_id = ?', [userId, questionId]);
    if (!result || result.affectedRows === 0) throw new ApiError(404, '未找到该收藏记录');
    sendSuccess(res, { favorited: false }, '取消收藏成功');
}));

/**
 * @api {get} /api/v1/study/favorites/check/:questionId 检查收藏状态
 * @apiDescription 检查题目是否已被收藏
 * @apiName CheckFavorite
 * @apiGroup Study
 * @apiParam {Number} questionId 题目ID
 */
router.get('/favorites/check/:questionId', authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const questionId = parseInt(req.params.questionId, 10);

    const isFavoriteResult = await db.query('SELECT * FROM user_favorites WHERE user_id = ? AND question_id = ?', [userId, questionId]);

    sendSuccess(res, { isFavorite: !!(isFavoriteResult && isFavoriteResult.length > 0) });
}));

// ===== Wrong Questions =====

/**
 * @api {get} /api/v1/study/wrong-questions 获取错题列表
 * @apiDescription 获取当前用户的错题列表
 * @apiName GetWrongQuestions
 * @apiGroup Study
 * @apiParam {Number} [page=1] 页码
 * @apiParam {Number} [limit=10] 每页数量
 * @apiParam {String} [category] 可选的分类筛选
 * @apiParam {String} [difficulty] 可选的难度筛选
 * @apiParam {String} [mastered] 是否已掌握 ('true' or 'false')
 */
router.get('/wrong-questions', asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    const { page = 1, limit = 10, mastered } = req.query;

    // 检查是否是游客用户
    if (!authHeader || authHeader.startsWith('Bearer guest_')) {
        // 游客用户，返回示例错题数据
        const sampleWrongQuestions = [
            {
                id: 1,
                title: "JavaScript变量声明",
                content: "JavaScript中var、let、const的区别是什么？",
                type: "single_choice",
                difficulty: "easy",
                options: JSON.stringify(["var有块级作用域，let和const没有", "let和const有块级作用域，var没有", "三者都有块级作用域", "三者都没有块级作用域"]),
                correct_answer: "let和const有块级作用域，var没有",
                explanation: "let和const具有块级作用域，var只有函数作用域。const声明的变量不能重新赋值。",
                wrong_count: 2,
                last_wrong_time: new Date().toISOString(),
                is_mastered: 0
            },
            {
                id: 2,
                title: "CSS定位属性",
                content: "CSS中position属性的值有哪些？",
                type: "multiple_choice",
                difficulty: "easy",
                options: JSON.stringify(["static", "relative", "absolute", "fixed"]),
                correct_answer: "static,relative,absolute,fixed",
                explanation: "position属性有static、relative、absolute、fixed、sticky等值。",
                wrong_count: 1,
                last_wrong_time: new Date().toISOString(),
                is_mastered: 0
            }
        ];

        sendSuccess(res, {
            wrongQuestions: sampleWrongQuestions,
            total: sampleWrongQuestions.length,
            isGuest: true
        });
        return;
    }

    // 正常用户，需要认证
    try {
        // 验证token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwt.secret);
        const userId = decoded.id;

        // 查询用户的错题
        const questions = await db.query(`
            SELECT q.*, wq.wrong_count, wq.last_wrong_time, wq.is_mastered
            FROM questions q
            JOIN user_wrong_questions wq ON q.id = wq.question_id
            WHERE wq.user_id = ?
            ORDER BY wq.last_wrong_time DESC
            LIMIT ? OFFSET ?
        `, [userId, parseInt(limit), (page - 1) * limit]);

        const totalResult = await db.query('SELECT COUNT(*) as total FROM user_wrong_questions WHERE user_id = ?', [userId]);

        sendSuccess(res, {
            wrongQuestions: questions,
            total: totalResult[0]?.total || 0,
            isGuest: false
        });
    } catch (error) {
        // Token验证失败，返回401
        return res.status(401).json({ success: false, message: '登录已过期，请重新登录' });
    }
}));

/**
 * @api {put} /api/v1/study/wrong-questions/:questionId/status 标记错题为已掌握或未掌握
 * @apiDescription 将错题标记为已掌握或未掌握
 * @apiName MarkWrongQuestionAsMastered
 * @apiGroup Study
 * @apiParam {Number} questionId 题目ID
 * @apiParam {Boolean} isMastered 是否已掌握
 */
router.put('/wrong-questions/:questionId/status', authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { questionId } = req.params;
    const { isMastered } = req.body;

    if (isMastered === undefined) throw new ApiError(400, '缺少 isMastered 状态');

    const result = await db.query(
        'UPDATE user_wrong_questions SET is_mastered = ? WHERE user_id = ? AND question_id = ?',
        [isMastered, userId, questionId]
    );

    if (!result || result.affectedRows === 0) throw new ApiError(404, '未找到该错题记录');
    sendSuccess(res, { isMastered }, '状态更新成功');
}));

// ===== Study Records & Submission =====
// This is a simplified version of submission logic
router.post('/submit', authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { questionId, userAnswer, isCorrect } = req.body;

    // In a real app, you would validate the answer server-side, not trust the client.
    // For now, we trust the `isCorrect` flag from the client.

    if (db.isUsingSqlite) {
        // SQLite简化版本（无事务）
        try {
            // 1. Record the study attempt
            await db.query('INSERT INTO user_study_records (user_id, question_id, is_correct) VALUES (?, ?, ?)', [userId, questionId, isCorrect]);

            // 2. If incorrect, add to or update wrong questions
            if (!isCorrect) {
                // 检查是否已存在错题记录
                const existingWrong = await db.query('SELECT * FROM user_wrong_questions WHERE user_id = ? AND question_id = ?', [userId, questionId]);
                
                if (existingWrong && existingWrong.length > 0) {
                    // 更新错题记录
                    await db.query(
                        'UPDATE user_wrong_questions SET wrong_count = wrong_count + 1, last_wrong_time = datetime("now"), is_mastered = 0 WHERE user_id = ? AND question_id = ?',
                        [userId, questionId]
                    );
                } else {
                    // 创建新的错题记录
                    await db.query(
                        'INSERT INTO user_wrong_questions (user_id, question_id, wrong_count, last_wrong_time, is_mastered) VALUES (?, ?, 1, datetime("now"), 0)',
                        [userId, questionId]
                    );
                }
            }

            // 3. Update user stats (simplified) 
            const existingStats = await db.query('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
            
            if (existingStats && existingStats.length > 0) {
                const statsUpdateQuery = isCorrect 
                    ? 'UPDATE user_stats SET total_questions = total_questions + 1, correct_questions = correct_questions + 1 WHERE user_id = ?'
                    : 'UPDATE user_stats SET total_questions = total_questions + 1 WHERE user_id = ?';
                await db.query(statsUpdateQuery, [userId]);
            } else {
                // 创建用户统计记录
                const correctQuestions = isCorrect ? 1 : 0;
                await db.query(
                    'INSERT INTO user_stats (user_id, total_questions, correct_questions, correct_rate, continuous_days, rank_position) VALUES (?, 1, ?, ?, 0, 0)',
                    [userId, correctQuestions, isCorrect ? 1.0 : 0.0]
                );
            }

            sendSuccess(res, { wasCorrect: isCorrect }, '答案提交成功');
        } catch (error) {
            throw new ApiError(500, '处理提交失败');
        }
    } else {
        // MySQL事务版本
        const connection = await db.beginTransaction();
        try {
            // 1. Record the study attempt
            await connection.execute('INSERT INTO user_study_records (user_id, question_id, is_correct) VALUES (?, ?, ?)', [userId, questionId, isCorrect]);

            // 2. If incorrect, add to or update wrong questions
            if (!isCorrect) {
                await connection.execute(`
                    INSERT INTO user_wrong_questions (user_id, question_id, wrong_count, last_wrong_time, is_mastered)
                    VALUES (?, ?, 1, NOW(), false)
                    ON DUPLICATE KEY UPDATE
                    wrong_count = wrong_count + 1,
                    last_wrong_time = NOW(),
                    is_mastered = false;
                `, [userId, questionId]);
            }

            // 3. Update user stats (simplified)
            const statsUpdateQuery = isCorrect 
                ? 'UPDATE user_stats SET total_questions = total_questions + 1, correct_questions = correct_questions + 1 WHERE user_id = ?'
                : 'UPDATE user_stats SET total_questions = total_questions + 1 WHERE user_id = ?';
            await connection.execute(statsUpdateQuery, [userId]);

            await db.commitTransaction(connection);
            sendSuccess(res, { wasCorrect: isCorrect }, '答案提交成功');
        } catch (error) {
            await db.rollbackTransaction(connection);
            throw new ApiError(500, '处理提交失败');
        }
    }
}));

// ===== 学习记录相关接口 =====

/**
 * @api {get} /api/v1/study/records 获取学习记录
 * @apiDescription 获取用户的学习记录
 * @apiName GetStudyRecords
 * @apiGroup Study
 * @apiParam {String} [startDate] 开始日期 (YYYY-MM-DD)
 * @apiParam {String} [endDate] 结束日期 (YYYY-MM-DD)
 * @apiParam {Number} [page=1] 页码
 * @apiParam {Number} [limit=10] 每页数量
 */
router.get('/records', authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    let userRecords = await pool.execute(`
        SELECT * FROM user_study_records
        WHERE user_id = ?
        AND study_date BETWEEN ? AND ?
        ORDER BY study_date DESC
        LIMIT ? OFFSET ?
    `, [userId, startDate, endDate, parseInt(limit), (page - 1) * limit]);

    const total = userRecords[0].length;
    const records = userRecords[0];
    
    // Calculate overall stats for the user
    const [[userStats]] = await pool.execute(`
        SELECT SUM(is_correct) AS total_correct, COUNT(*) AS total_questions, SUM(study_time) AS total_time
        FROM user_study_records
        WHERE user_id = ?
    `, [userId]);
    const totalCorrect = userStats.total_correct;
    const totalQuestions = userStats.total_questions;
    const totalTime = userStats.total_time;
    const studyDays = new Set(records.map(r => r.study_date.toISOString().split('T')[0])).size;

    sendSuccess(res, {
        records,
        total,
        stats: {
            totalQuestions,
            totalCorrect,
            totalTime,
            studyDays,
        }
    });
}));

// ===== 学习统计相关接口 =====

/**
 * @api {get} /api/v1/study/stats 获取用户的学习统计数据
 * @apiName GetStudyStats
 * @apiGroup Study
 */
router.get('/stats', authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Calculate overall stats for the user
    const [[userStats]] = await pool.execute(`
        SELECT SUM(is_correct) AS total_correct, COUNT(*) AS total_questions, SUM(study_time) AS total_time
        FROM user_study_records
        WHERE user_id = ?
    `, [userId]);
    const totalCorrect = userStats.total_correct;
    const totalQuestions = userStats.total_questions;
    const totalTime = userStats.total_time;
    const studyDays = new Set(records.map(r => r.study_date.toISOString().split('T')[0])).size;

    sendSuccess(res, {
        stats: {
            totalQuestions,
            totalCorrect,
            totalTime,
            studyDays,
        }
    });
}));

// ===== 学习记录 =====
router.get('/history', authMiddleware, asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // 获取历史记录
    const [history] = await pool.execute(
      `SELECT 
         ua.id, ua.question_id AS questionId, ua.user_answer AS userAnswer, 
         ua.is_correct AS isCorrect, ua.answered_at AS answeredAt,
         q.title, q.type
       FROM user_answers ua
       JOIN questions q ON ua.question_id = q.id
       WHERE ua.user_id = ?
       ORDER BY ua.answered_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    
    // 处理JSON字段
    const processedHistory = history.map(record => ({
      ...record,
      options: JSON.parse(record.options || '[]'),
      tags: JSON.parse(record.tags || '[]')
    }));
    
    sendSuccess(res, {
      history: processedHistory,
      pagination: {
        total: history.length,
        page,
        limit,
        pages: Math.ceil(history.length / limit)
      }
    });
  } catch (error) {
    console.error('获取学习历史失败:', error);
    throw new ApiError(500, '获取学习历史失败');
  }
}));

// ===== 考试模式 =====
router.post('/exam', authMiddleware, asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, difficulty, questionCount = 10 } = req.body;
    
    // 获取符合条件的题目
    const [questions] = await pool.execute(
      `SELECT id, title, type, options, difficulty, category, tags 
       FROM questions 
       WHERE difficulty = ? AND category = ? 
       ORDER BY RAND() 
       LIMIT ?`,
      [difficulty, category, questionCount]
    );
    
    const processedQuestions = questions.map(question => ({
      ...question,
      options: JSON.parse(question.options || '[]'),
      tags: JSON.parse(question.tags || '[]')
    }));
    
    // 创建考试记录
    const [exam] = await pool.execute(
      `INSERT INTO exams (user_id, status, score, time_spent, created_at) 
       VALUES (?, 'pending', 0, 0, CURRENT_TIMESTAMP)`,
      [userId]
    );
    const examId = exam.insertId;
    
    sendSuccess(res, {
      examId,
      questions: processedQuestions
    });
  } catch (error) {
    console.error('创建考试失败:', error);
    throw new ApiError(500, '创建考试失败');
  }
}));

router.post('/exam/:id/submit', authMiddleware, asyncHandler(async (req, res) => {
  try {
    const examId = parseInt(req.params.id);
    const { answers, timeSpent } = req.body;
    
    // 计算总分
    let totalScore = 0;
    let correctCount = 0;
    for (const answer of answers) {
      if (answer.isCorrect) {
        totalScore += answer.score;
        correctCount++;
      }
    }
    
    // 更新考试记录
    await pool.execute(
      `UPDATE exams SET status = 'completed', score = ?, time_spent = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [totalScore, timeSpent, examId]
    );
    
    sendSuccess(res, {
      score: totalScore,
      correctCount,
      totalCount: answers.length
    });
  } catch (error) {
    console.error('提交考试失败:', error);
    throw new ApiError(500, '提交考试失败');
  }
}));

// ===================================
// Article Study Data
// ===================================

// GET /study/articles/favorites - Get user's favorite articles
router.get('/articles/favorites', authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const favoriteRecords = await pool.execute(`
        SELECT * FROM user_article_favorites
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), (page - 1) * limit]);
    
    const favoriteArticleIds = favoriteRecords[0].map(f => f.article_id);
    
    const favoriteArticles = await pool.execute(`
        SELECT a.*, c.name AS categoryName, u.username AS authorName
        FROM articles a
        JOIN article_categories c ON a.category_id = c.id
        JOIN users u ON a.author_id = u.id
        WHERE a.id IN (?)
    `, [favoriteArticleIds]);

    const total = favoriteArticles[0].length;
    const pageData = favoriteArticles[0]
        .sort((a, b) => favoriteRecords[0].find(f => f.article_id === a.id).created_at - favoriteRecords[0].find(f => f.article_id === b.id).created_at);

    sendSuccess(res, { items: pageData, total });
}));

// POST /study/articles/:articleId/favorite - Toggle favorite status for an article
router.post('/articles/:articleId/favorite', authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const articleId = parseInt(req.params.articleId, 10);

    const [[article]] = await pool.execute('SELECT id FROM articles WHERE id = ?', [articleId]);
    if (!article) throw new ApiError(404, 'Article not found.');

    const [[favorite]] = await pool.execute('SELECT * FROM user_article_favorites WHERE user_id = ? AND article_id = ?', [userId, articleId]);
    
    let favorited = false;
    if (favorite) {
        // Already favorited, so remove it
        await pool.execute('DELETE FROM user_article_favorites WHERE user_id = ? AND article_id = ?', [userId, articleId]);
        favorited = false;
    } else {
        // Not favorited, so add it
        await pool.execute('INSERT INTO user_article_favorites (user_id, article_id) VALUES (?, ?)', [userId, articleId]);
        favorited = true;
    }
    
    sendSuccess(res, { favorited }, favorited ? 'Article favorited successfully.' : 'Article unfavorited successfully.');
}));

// GET /study/articles/:articleId/favorite/check - Check if an article is favorited
router.get('/articles/:articleId/favorite/check', authMiddleware, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const articleId = parseInt(req.params.articleId, 10);

    const [[isFavorited]] = await pool.execute('SELECT * FROM user_article_favorites WHERE user_id = ? AND article_id = ?', [userId, articleId]);

    sendSuccess(res, { isFavorited: !!isFavorited });
}));

module.exports = router;