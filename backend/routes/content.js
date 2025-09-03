const express = require('express');
const config = require('../config');
const { verifyToken: authMiddleware } = require('../middleware/auth');
const { sendSuccess } = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/errorHandler');
const contentService = require('../services/contentService');
const jwt = require('jsonwebtoken');

const router = express.Router();

// ===================================
// Article Category Management
// ===================================

router.get('/articles/categories', asyncHandler(async (req, res) => {
    const result = await contentService.getCategories();
    sendSuccess(res, result);
}));

router.post('/articles/categories', authMiddleware, asyncHandler(async (req, res) => {
    const newCategory = await contentService.createCategory(req.body);
    sendSuccess(res, newCategory, '分类创建成功', 201);
}));

router.put('/articles/categories/:id', authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updatedCategory = await contentService.updateCategory(id, req.body);
    sendSuccess(res, updatedCategory, '分类更新成功');
}));

router.delete('/articles/categories/:id', authMiddleware, asyncHandler(async (req, res) => {
    const { id } = req.params;
    await contentService.deleteCategory(id);
    sendSuccess(res, null, '分类删除成功');
}));

// ===================================
// Article Management
// ===================================

router.get('/articles', asyncHandler(async (req, res) => {
    const result = await contentService.getArticles(req.query);
    sendSuccess(res, result);
}));

router.get('/articles/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Optional-auth: Check for a user token to determine like/favorite status
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            userId = decoded.id;
        } catch (e) {
            // Invalid token, proceed as a guest user
        }
    }

    const article = await contentService.getArticleById(id, userId);
    sendSuccess(res, article);
}));

router.post('/articles', authMiddleware, asyncHandler(async (req, res) => {
    const newArticle = await contentService.createArticle(req.body, req.user.id);
    sendSuccess(res, newArticle, '文章创建成功', 201);
}));

// ===================================
// Article Interaction
// ===================================

router.get('/articles/:id/comments', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await contentService.getArticleComments(id, req.query);
    sendSuccess(res, result);
}));

router.post('/articles/:id/comments', authMiddleware, asyncHandler(async (req, res) => {
    const newComment = await contentService.createComment(req.params.id, req.user.id, req.body);
    sendSuccess(res, newComment, '评论发布成功', 201);
}));

router.post('/articles/:id/like', authMiddleware, asyncHandler(async (req, res) => {
    const result = await contentService.toggleLike(req.params.id, req.user.id);
    sendSuccess(res, result, result.liked ? '点赞成功' : '已取消点赞');
}));

router.post('/articles/:id/favorite', authMiddleware, asyncHandler(async (req, res) => {
    const result = await contentService.toggleFavorite(req.params.id, req.user.id);
    sendSuccess(res, result, result.favorited ? '收藏成功' : '已取消收藏');
}));

module.exports = router;