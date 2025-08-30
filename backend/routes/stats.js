
const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth').verifyToken;
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

// GET user statistics summary
router.get('/summary', auth, catchAsync(async (req, res) => {
    const userId = req.user.id;

    // 1. Get total answers and correct answers from the log
    const [answerStats] = await db.query(`
        SELECT 
            COUNT(*) as total_answered,
            SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as total_correct
        FROM user_answer_log 
        WHERE user_id = ?
    `, [userId]);

    // 2. Get total favorites
    const [[{ total_favorites }]] = await db.query('SELECT COUNT(*) as total_favorites FROM user_favorites WHERE user_id = ?', [userId]);

    // 3. Get total wrong answers (for quick access)
    const [[{ total_wrong }]] = await db.query('SELECT COUNT(*) as total_wrong FROM user_wrong_answers WHERE user_id = ?', [userId]);

    // 4. Get total completed exams
    const [[{ total_exams }]] = await db.query('SELECT COUNT(*) as total_exams FROM exam_attempts WHERE user_id = ? AND status = \'completed\'', [userId]);

    const { total_answered, total_correct } = answerStats[0];
    const accuracy = (total_answered > 0) ? (total_correct / total_answered) * 100 : 0;

    const summary = {
        total_answered: parseInt(total_answered),
        total_correct: parseInt(total_correct),
        accuracy: parseFloat(accuracy.toFixed(2)),
        total_favorites: parseInt(total_favorites),
        total_wrong: parseInt(total_wrong),
        total_exams_completed: parseInt(total_exams)
    };

    res.status(200).json({ success: true, data: summary });
}));

module.exports = router;
