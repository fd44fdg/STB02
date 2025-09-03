const express = require('express');
const { verifyToken: authMiddleware } = require('../middleware/auth');
const { sendSuccess } = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/errorHandler');
const knowledgeService = require('../services/knowledgeService');

const router = express.Router();

// --- Knowledge Categories ---

router.get('/categories', asyncHandler(async (req, res) => {
    const result = await knowledgeService.getCategories();
    sendSuccess(res, result);
}));

router.post('/categories', authMiddleware, asyncHandler(async (req, res) => {
    const newCategory = await knowledgeService.createCategory(req.body);
    sendSuccess(res, newCategory, '分类创建成功', 201);
}));

router.delete('/categories/:id', authMiddleware, asyncHandler(async (req, res) => {
    await knowledgeService.deleteCategory(req.params.id);
    sendSuccess(res, null, '分类删除成功');
}));

// --- Knowledge Points ---

router.get('/points', asyncHandler(async (req, res) => {
    const result = await knowledgeService.getPoints(req.query);
    sendSuccess(res, result);
}));

router.get('/points/:id', asyncHandler(async (req, res) => {
    const point = await knowledgeService.getPointById(req.params.id);
    sendSuccess(res, point);
}));

router.post('/points', authMiddleware, asyncHandler(async (req, res) => {
    const newPoint = await knowledgeService.createPoint(req.body);
    sendSuccess(res, newPoint, '知识点创建成功', 201);
}));

router.put('/points/:id', authMiddleware, asyncHandler(async (req, res) => {
    const updatedPoint = await knowledgeService.updatePoint(req.params.id, req.body);
    sendSuccess(res, updatedPoint, '知识点更新成功');
}));

router.delete('/points/:id', authMiddleware, asyncHandler(async (req, res) => {
    await knowledgeService.deletePoint(req.params.id);
    sendSuccess(res, null, '知识点删除成功');
}));

module.exports = router;