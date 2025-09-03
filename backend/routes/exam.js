
const express = require('express');
const { verifyToken: auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/responseHandler');
const examService = require('../services/examService');

const router = express.Router();

router.get('/', auth, asyncHandler(async (req, res) => {
    const result = await examService.getExams();
    sendSuccess(res, result);
}));

router.get('/:id', auth, asyncHandler(async (req, res) => {
    const exam = await examService.getExamById(req.params.id);
    sendSuccess(res, exam);
}));

router.post('/', auth, asyncHandler(async (req, res) => {
    const newExam = await examService.createExam(req.body, req.user.id);
    sendSuccess(res, newExam, '考试创建成功', 201);
}));

router.put('/:id', auth, asyncHandler(async (req, res) => {
    const updatedExam = await examService.updateExam(req.params.id, req.body);
    sendSuccess(res, updatedExam);
}));

router.delete('/:id', auth, asyncHandler(async (req, res) => {
    await examService.deleteExam(req.params.id);
    res.status(204).send();
}));

// --- User-facing Exam Attempt Endpoints ---

router.post('/:id/start', auth, asyncHandler(async (req, res) => {
    const result = await examService.startExamAttempt(req.params.id, req.user.id);
    sendSuccess(res, result);
}));

router.post('/attempts/:attemptId/submit', auth, asyncHandler(async (req, res) => {
    const result = await examService.submitExamAttempt(req.params.attemptId, req.user.id, req.body.answers);
    sendSuccess(res, result, 'Exam submitted successfully.');
}));

router.get('/attempts/:attemptId/result', auth, asyncHandler(async (req, res) => {
    const result = await examService.getExamAttemptResult(req.params.attemptId, req.user.id);
    sendSuccess(res, result);
}));

module.exports = router;
