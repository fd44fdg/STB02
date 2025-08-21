const express = require('express');
const { pool } = require('../config/database');
const { verifyToken: authMiddleware } = require('../middleware/auth');
const { sendSuccess } = require('../utils/responseHandler');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

// --- Question Categories ---

router.get('/categories', catchAsync(async (req, res) => {
    const [categories] = await pool.execute(`
        SELECT c.*, COUNT(q.id) as questionCount
        FROM question_categories c
        LEFT JOIN questions q ON c.id = q.category_id
        GROUP BY c.id
    `);
    sendSuccess(res, { items: categories, total: categories.length });
}));

router.post('/categories', authMiddleware, catchAsync(async (req, res) => {
    const { name, description } = req.body;
    if (!name) throw new ApiError(400, '分类名称不能为空');

    const [result] = await pool.execute('INSERT INTO question_categories (name, description) VALUES (?, ?)', [name, description || '']);
    const [[newCategory]] = await pool.execute('SELECT * FROM question_categories WHERE id = ?', [result.insertId]);
    sendSuccess(res, newCategory, '分类创建成功', 201);
}));

router.put('/categories/:id', authMiddleware, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name && !description) throw new ApiError(400, '没有提供要更新的字段');

    const [result] = await pool.execute('UPDATE question_categories SET name = ?, description = ? WHERE id = ?', [name, description, id]);
    if (result.affectedRows === 0) throw new ApiError(404, '分类不存在');
    
    const [[updatedCategory]] = await pool.execute('SELECT * FROM question_categories WHERE id = ?', [id]);
    sendSuccess(res, updatedCategory, '分类更新成功');
}));

router.delete('/categories/:id', authMiddleware, catchAsync(async (req, res) => {
    const { id } = req.params;
    const [[{ count }]] = await pool.execute('SELECT COUNT(*) as count FROM questions WHERE category_id = ?', [id]);
    if (count > 0) throw new ApiError(400, '该分类下仍有题目，无法删除');

    const [result] = await pool.execute('DELETE FROM question_categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) throw new ApiError(404, '分类不存在');

    sendSuccess(res, null, '分类删除成功');
}));

// --- Questions ---

router.get('/', catchAsync(async (req, res) => {
    const { page = 1, limit = 10, category_id } = req.query;
    // Simplified query. A real implementation would have more filters.
    let query = 'SELECT * FROM questions';
    let countQuery = 'SELECT COUNT(*) as total FROM questions';
    const params = [];

    if (category_id) {
        query += ' WHERE category_id = ?';
        countQuery += ' WHERE category_id = ?';
        params.push(category_id);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (page - 1) * limit);

    const [questions] = await pool.execute(query, params);
    const [[{ total }]] = await pool.execute(countQuery, params.slice(0, params.length-2)); // remove limit/offset for count

    // Parse JSON fields
    questions.forEach(q => {
        q.options = JSON.parse(q.options);
        q.correct_answer = JSON.parse(q.correct_answer);
    });

    sendSuccess(res, { items: questions, total });
}));

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const [[question]] = await pool.execute('SELECT * FROM questions WHERE id = ?', [id]);
    if (!question) throw new ApiError(404, '题目不存在');
    
    question.options = JSON.parse(question.options);
    question.correct_answer = JSON.parse(question.correct_answer);
    
    sendSuccess(res, question);
}));

// 单个题目创建（增强版）
router.post('/', authMiddleware, catchAsync(async (req, res) => {
    const { 
        title, content, category_id, type, options, correct_answer, 
        difficulty, explanation, tags, knowledge_points, score, 
        images, attachments, time_limit, status 
    } = req.body;
    
    if (!title || !category_id || !type) {
        throw new ApiError(400, '缺少必要的题目参数');
    }
    
    // 验证题目类型和选项
    if (['single', 'multiple', 'boolean'].includes(type) && (!options || options.length < 2)) {
        throw new ApiError(400, '选择题至少需要2个选项');
    }
    
    if (!correct_answer) {
        throw new ApiError(400, '请设置正确答案');
    }
    
    const [result] = await pool.execute(
        `INSERT INTO questions (
            title, content, category_id, type, options, correct_answer, 
            difficulty, explanation, tags, knowledge_points, score, 
            images, attachments, time_limit, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            title, content || '', category_id, type, 
            JSON.stringify(options || []), JSON.stringify(correct_answer), 
            difficulty || 'medium', explanation || '', 
            JSON.stringify(tags || []), JSON.stringify(knowledge_points || []), 
            score || 5, JSON.stringify(images || []), 
            JSON.stringify(attachments || []), time_limit || null, 
            status !== undefined ? status : 1, req.user.id
        ]
    );
    
    const [[newQuestion]] = await pool.execute('SELECT * FROM questions WHERE id = ?', [result.insertId]);
    sendSuccess(res, newQuestion, '题目创建成功', 201);
}));

// 批量创建题目
router.post('/batch', authMiddleware, catchAsync(async (req, res) => {
    const { questions } = req.body;
    
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new ApiError(400, '请提供有效的题目数组');
    }
    
    if (questions.length > 100) {
        throw new ApiError(400, '单次最多创建100道题目');
    }
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < questions.length; i++) {
        try {
            const question = questions[i];
            const { 
                title, content, category_id, type, options, correct_answer, 
                difficulty, explanation, tags, knowledge_points, score, 
                images, attachments, time_limit, status 
            } = question;
            
            if (!title || !category_id || !type) {
                errors.push({ index: i + 1, error: '缺少必要的题目参数' });
                continue;
            }
            
            const [result] = await pool.execute(
                `INSERT INTO questions (
                    title, content, category_id, type, options, correct_answer, 
                    difficulty, explanation, tags, knowledge_points, score, 
                    images, attachments, time_limit, status, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    title, content || '', category_id, type, 
                    JSON.stringify(options || []), JSON.stringify(correct_answer), 
                    difficulty || 'medium', explanation || '', 
                    JSON.stringify(tags || []), JSON.stringify(knowledge_points || []), 
                    score || 5, JSON.stringify(images || []), 
                    JSON.stringify(attachments || []), time_limit || null, 
                    status !== undefined ? status : 1, req.user.id
                ]
            );
            
            results.push({ index: i + 1, id: result.insertId, success: true });
        } catch (error) {
            errors.push({ index: i + 1, error: error.message });
        }
    }
    
    sendSuccess(res, { 
        total: questions.length,
        success: results.length,
        failed: errors.length,
        results,
        errors
    }, `批量创建完成，成功${results.length}道，失败${errors.length}道`);
}));

// 从模板创建题目
router.post('/from-template/:templateId', authMiddleware, catchAsync(async (req, res) => {
    const { templateId } = req.params;
    const { customData } = req.body;
    
    // 获取模板
    const [[template]] = await pool.execute('SELECT * FROM question_templates WHERE id = ?', [templateId]);
    if (!template) {
        throw new ApiError(404, '题目模板不存在');
    }
    
    const templateData = JSON.parse(template.template_data);
    
    // 合并模板数据和自定义数据
    const questionData = { ...templateData, ...customData };
    
    const [result] = await pool.execute(
        `INSERT INTO questions (
            title, content, category_id, type, options, correct_answer, 
            difficulty, explanation, tags, knowledge_points, score, 
            images, attachments, time_limit, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            questionData.title, questionData.content || '', questionData.category_id, questionData.type, 
            JSON.stringify(questionData.options || []), JSON.stringify(questionData.correct_answer), 
            questionData.difficulty || 'medium', questionData.explanation || '', 
            JSON.stringify(questionData.tags || []), JSON.stringify(questionData.knowledge_points || []), 
            questionData.score || 5, JSON.stringify(questionData.images || []), 
            JSON.stringify(questionData.attachments || []), questionData.time_limit || null, 
            questionData.status !== undefined ? questionData.status : 1, req.user.id
        ]
    );
    
    const [[newQuestion]] = await pool.execute('SELECT * FROM questions WHERE id = ?', [result.insertId]);
    sendSuccess(res, newQuestion, '从模板创建题目成功', 201);
}));

// 题目模板管理
router.get('/templates', authMiddleware, catchAsync(async (req, res) => {
    const [templates] = await pool.execute(`
        SELECT t.*, u.username as creator_name 
        FROM question_templates t 
        LEFT JOIN users u ON t.created_by = u.id 
        ORDER BY t.created_at DESC
    `);
    sendSuccess(res, { items: templates, total: templates.length });
}));

router.post('/templates', authMiddleware, catchAsync(async (req, res) => {
    const { name, description, template_data, category_id } = req.body;
    
    if (!name || !template_data) {
        throw new ApiError(400, '模板名称和数据不能为空');
    }
    
    const [result] = await pool.execute(
        'INSERT INTO question_templates (name, description, template_data, category_id, created_by) VALUES (?, ?, ?, ?, ?)',
        [name, description || '', JSON.stringify(template_data), category_id, req.user.id]
    );
    
    const [[newTemplate]] = await pool.execute('SELECT * FROM question_templates WHERE id = ?', [result.insertId]);
    sendSuccess(res, newTemplate, '模板创建成功', 201);
}));

// 文件上传接口
router.post('/upload', authMiddleware, catchAsync(async (req, res) => {
    // 这里需要配合multer中间件处理文件上传
    if (!req.file) {
        throw new ApiError(400, '请选择要上传的文件');
    }
    
    const fileInfo = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        url: `/uploads/${req.file.filename}`
    };
    
    sendSuccess(res, fileInfo, '文件上传成功');
}));

// Excel批量导入题目
router.post('/import/excel', authMiddleware, catchAsync(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, '请上传Excel文件');
    }
    
    // 这里需要使用xlsx库解析Excel文件
    // 示例响应，实际需要实现Excel解析逻辑
    const importResult = {
        total: 0,
        success: 0,
        failed: 0,
        errors: []
    };
    
    sendSuccess(res, importResult, 'Excel导入完成');
}));

// 导出题目为Excel
router.get('/export/excel', authMiddleware, catchAsync(async (req, res) => {
    const { category_id, difficulty, type } = req.query;
    
    let query = 'SELECT * FROM questions WHERE 1=1';
    const params = [];
    
    if (category_id) {
        query += ' AND category_id = ?';
        params.push(category_id);
    }
    
    if (difficulty) {
        query += ' AND difficulty = ?';
        params.push(difficulty);
    }
    
    if (type) {
        query += ' AND type = ?';
        params.push(type);
    }
    
    const [questions] = await pool.execute(query, params);
    
    // 这里需要使用xlsx库生成Excel文件
    // 示例响应，实际需要实现Excel生成逻辑
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=questions.xlsx');
    
    sendSuccess(res, { message: '导出功能需要实现Excel生成逻辑' });
}));

// 题目统计分析
router.get('/analytics', authMiddleware, catchAsync(async (req, res) => {
    const [categoryStats] = await pool.execute(`
        SELECT 
            c.name as category_name,
            COUNT(q.id) as question_count,
            AVG(q.score) as avg_score
        FROM question_categories c
        LEFT JOIN questions q ON c.id = q.category_id
        GROUP BY c.id, c.name
    `);
    
    const [difficultyStats] = await pool.execute(`
        SELECT 
            difficulty,
            COUNT(*) as count
        FROM questions 
        GROUP BY difficulty
    `);
    
    const [typeStats] = await pool.execute(`
        SELECT 
            type,
            COUNT(*) as count
        FROM questions 
        GROUP BY type
    `);
    
    const [[totalStats]] = await pool.execute(`
        SELECT 
            COUNT(*) as total_questions,
            AVG(score) as avg_score,
            MAX(created_at) as latest_created
        FROM questions
    `);
    
    sendSuccess(res, {
        total: totalStats,
        by_category: categoryStats,
        by_difficulty: difficultyStats,
        by_type: typeStats
    });
}));

// PUT and DELETE for questions would follow a similar pattern.
router.put('/:id', authMiddleware, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { 
        title, content, category_id, type, options, correct_answer, 
        difficulty, explanation, tags, knowledge_points, score, 
        images, attachments, time_limit, status 
    } = req.body;
    
    const [result] = await pool.execute(
        `UPDATE questions SET 
            title = ?, content = ?, category_id = ?, type = ?, options = ?, 
            correct_answer = ?, difficulty = ?, explanation = ?, tags = ?, 
            knowledge_points = ?, score = ?, images = ?, attachments = ?, 
            time_limit = ?, status = ?, updated_at = NOW()
        WHERE id = ?`,
        [
            title, content || '', category_id, type, 
            JSON.stringify(options || []), JSON.stringify(correct_answer), 
            difficulty || 'medium', explanation || '', 
            JSON.stringify(tags || []), JSON.stringify(knowledge_points || []), 
            score || 5, JSON.stringify(images || []), 
            JSON.stringify(attachments || []), time_limit || null, 
            status !== undefined ? status : 1, id
        ]
    );
    
    if (result.affectedRows === 0) {
        throw new ApiError(404, '题目不存在');
    }
    
    const [[updatedQuestion]] = await pool.execute('SELECT * FROM questions WHERE id = ?', [id]);
    sendSuccess(res, updatedQuestion, '题目更新成功');
}));

router.delete('/:id', authMiddleware, catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const [result] = await pool.execute('DELETE FROM questions WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
        throw new ApiError(404, '题目不存在');
    }
    
    sendSuccess(res, null, '题目删除成功');
}));

module.exports = router;