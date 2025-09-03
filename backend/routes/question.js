const express = require('express');
const { verifyToken: authMiddleware } = require('../middleware/auth');
const { sendSuccess } = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/errorHandler');
const questionService = require('../services/questionService');

const router = express.Router();

// --- Question Categories ---

router.get('/categories', asyncHandler(async (req, res) => {
    const result = await questionService.getCategories();
    sendSuccess(res, result);
}));

router.post('/categories', authMiddleware, asyncHandler(async (req, res) => {
    const newCategory = await questionService.createCategory(req.body, req.user.id);
    sendSuccess(res, newCategory, '分类创建成功', 201);
}));

router.put('/categories/:id', authMiddleware, asyncHandler(async (req, res) => {
    const updatedCategory = await questionService.updateCategory(req.params.id, req.body);
    sendSuccess(res, updatedCategory, '分类更新成功');
}));

router.delete('/categories/:id', authMiddleware, asyncHandler(async (req, res) => {
    await questionService.deleteCategory(req.params.id);
    sendSuccess(res, null, '分类删除成功');
}));

// --- Questions ---

router.get('/', asyncHandler(async (req, res) => {
    const result = await questionService.getQuestions(req.query);
    sendSuccess(res, result);
}));

router.get('/:id', asyncHandler(async (req, res) => {
    const question = await questionService.getQuestionById(req.params.id);
    sendSuccess(res, question);
}));

router.post('/', authMiddleware, asyncHandler(async (req, res) => {
    const newQuestion = await questionService.createQuestion(req.body, req.user.id);
    sendSuccess(res, newQuestion, '题目创建成功', 201);
}));

router.post('/batch', authMiddleware, asyncHandler(async (req, res) => {
    const result = await questionService.batchCreateQuestions(req.body.questions, req.user.id);
    sendSuccess(res, result, `批量创建完成，成功${result.success}道，失败${result.failed}道`);
}));

router.post('/from-template/:templateId', authMiddleware, asyncHandler(async (req, res) => {
    // TODO: Move template logic to questionService
    const { templateId } = req.params;
    const { customData } = req.body;
    
    const db = require('../config/db');
    const ApiError = require('../utils/ApiError');
    
    const template = await db('question_templates').where({ id: templateId }).first();
    if (!template) {
        throw new ApiError(404, '题目模板不存在');
    }
    
    const templateData = JSON.parse(template.template_data);
    const questionData = { ...templateData, ...customData };
    
    const newQuestion = await questionService.createQuestion(questionData, req.user.id);
    sendSuccess(res, newQuestion, '从模板创建题目成功', 201);
}));

router.get('/templates', authMiddleware, asyncHandler(async (req, res) => {
    // TODO: Move template logic to questionService
    const db = require('../config/db');
    const templates = await db('question_templates')
        .leftJoin('users', 'question_templates.created_by', 'users.id')
        .select('question_templates.*', 'users.username as creator_name')
        .orderBy('question_templates.created_at', 'desc');
    sendSuccess(res, { items: templates, total: templates.length });
}));

router.post('/templates', authMiddleware, asyncHandler(async (req, res) => {
    // TODO: Move template logic to questionService
    const { name, description, template_data, category_id } = req.body;
    const ApiError = require('../utils/ApiError');
    
    if (!name || !template_data) {
        throw new ApiError(400, '模板名称和数据不能为空');
    }
    
    const db = require('../config/db');
    const [id] = await db('question_templates').insert({
        name,
        description: description || '',
        template_data: JSON.stringify(template_data),
        category_id,
        created_by: req.user.id
    });
    
    const newTemplate = await db('question_templates').where({ id }).first();
    sendSuccess(res, newTemplate, '模板创建成功', 201);
}));

const { createUploader } = require('../middleware/upload');
const uploadAny = createUploader({ subdir: 'questions' });

router.post('/upload', authMiddleware, uploadAny.single('file'), asyncHandler(async (req, res) => {
    const ApiError = require('../utils/ApiError');
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

const uploadExcel = createUploader({ subdir: 'imports', allowedTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'] });

router.post('/import/excel', authMiddleware, uploadExcel.single('file'), asyncHandler(async (req, res) => {
    const ApiError = require('../utils/ApiError');
    if (!req.file) {
        throw new ApiError(400, '请上传Excel文件');
    }
    
    // TODO: Implement Excel import logic
    const importResult = {
        total: 0,
        success: 0,
        failed: 0,
        errors: []
    };
    
    sendSuccess(res, importResult, 'Excel导入完成');
}));

router.get('/export/excel', authMiddleware, asyncHandler(async (req, res) => {
    // TODO: Implement Excel export logic
    const { category_id, difficulty, type } = req.query;
    
    const db = require('../config/db');
    let query = db('questions');
    
    if (category_id) query = query.where({ category_id });
    if (difficulty) query = query.where({ difficulty });
    if (type) query = query.where({ type });
    
    const questions = await query;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=questions.xlsx');
    
    sendSuccess(res, { message: '导出功能需要实现Excel生成逻辑' });
}));

router.get('/analytics', authMiddleware, asyncHandler(async (req, res) => {
    const analytics = await questionService.getAnalytics();
    sendSuccess(res, analytics);
}));

router.put('/:id', authMiddleware, asyncHandler(async (req, res) => {
    const updatedQuestion = await questionService.updateQuestion(req.params.id, req.body);
    sendSuccess(res, updatedQuestion, '题目更新成功');
}));

router.delete('/:id', authMiddleware, asyncHandler(async (req, res) => {
    await questionService.deleteQuestion(req.params.id);
    sendSuccess(res, null, '题目删除成功');
}));

module.exports = router;