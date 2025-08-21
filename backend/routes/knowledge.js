const express = require('express');
const { pool } = require('../config/database');
const { verifyToken: authMiddleware } = require('../middleware/auth');
const { sendSuccess } = require('../utils/responseHandler');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

// --- Knowledge Categories ---

router.get('/categories', catchAsync(async (req, res) => {
    // In a real app, filters like name, status would be added to the query
    const [categories] = await pool.execute(`
        SELECT c.*, COUNT(p.id) as pointCount 
        FROM knowledge_categories c 
        LEFT JOIN knowledge_points p ON c.id = p.category_id 
        GROUP BY c.id
    `);
    sendSuccess(res, { items: categories, total: categories.length });
}));

router.post('/categories', authMiddleware, catchAsync(async (req, res) => {
    const { name, description, sort = 0, status = 1 } = req.body;
    if (!name) throw new ApiError(400, '分类名称不能为空');

    const [result] = await pool.execute('INSERT INTO knowledge_categories (name, description, sort, status) VALUES (?, ?, ?, ?)', [name, description || '', sort, status]);
    const [[newCategory]] = await pool.execute('SELECT * FROM knowledge_categories WHERE id = ?', [result.insertId]);
    sendSuccess(res, newCategory, '分类创建成功', 201);
}));

router.delete('/categories/:id', authMiddleware, catchAsync(async (req, res) => {
    const { id } = req.params;
    const [[{ count }]] = await pool.execute('SELECT COUNT(*) as count FROM knowledge_points WHERE category_id = ?', [id]);
    if (count > 0) throw new ApiError(400, '该分类下仍有知识点，无法删除');

    const [result] = await pool.execute('DELETE FROM knowledge_categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) throw new ApiError(404, '分类不存在');
    sendSuccess(res, null, '分类删除成功');
}));

// --- Knowledge Points ---

router.get('/points', catchAsync(async (req, res) => {
    const { page = 1, limit = 10, category_id } = req.query;
    // Simplified query. A real implementation would have more filters.
    let query = 'SELECT p.*, c.name as category_name FROM knowledge_points p LEFT JOIN knowledge_categories c ON p.category_id = c.id';
    let countQuery = 'SELECT COUNT(*) as total FROM knowledge_points';
    const params = [];

    if (category_id) {
        query += ' WHERE p.category_id = ?';
        countQuery += ' WHERE category_id = ?';
        params.push(category_id);
    }
    
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (page - 1) * limit);

    const [points] = await pool.execute(query, params);
    const [[{ total }]] = await pool.execute(countQuery, params.slice(0, params.length-2));

    sendSuccess(res, { items: points, total });
}));

router.get('/points/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const [[point]] = await pool.execute(
        'SELECT p.*, c.name as category_name FROM knowledge_points p LEFT JOIN knowledge_categories c ON p.category_id = c.id WHERE p.id = ?', 
        [id]
    );
    if (!point) throw new ApiError(404, '知识点不存在');
    sendSuccess(res, point);
}));

router.post('/points', authMiddleware, catchAsync(async (req, res) => {
    const { name, category_id, difficulty, description, content, status } = req.body;
    if (!name || !category_id || !difficulty) {
        throw new ApiError(400, '名称、分类和难度为必填项');
    }
    const [result] = await pool.execute(
        `INSERT INTO knowledge_points (name, category_id, difficulty, description, content, status) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, category_id, difficulty, description || '', content || '', status !== undefined ? status : 1]
    );
    const [[newPoint]] = await pool.execute('SELECT * FROM knowledge_points WHERE id = ?', [result.insertId]);
    sendSuccess(res, newPoint, '知识点创建成功', 201);
}));

// PUT and DELETE for points would follow a similar pattern.

module.exports = router;