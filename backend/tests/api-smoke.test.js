const request = require('supertest');
// Build a minimal app for contract tests to avoid heavy middlewares
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('../routes/auth');
const questionRoutes = require('../routes/question');
const { globalErrorHandler } = require('../middleware/errorHandler');
const ApiError = require('../utils/ApiError');

const app = express();
app.use(bodyParser.json());
// mount only minimal routes under /api/v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', authRoutes);
app.use('/api/v1/questions', questionRoutes);
// 404
app.use('*', (req, res, next) => next(new ApiError(404, '接口不存在')));
app.use(globalErrorHandler);


/**
 * 最小合同测试：不依赖数据库，只验证路由与协议
 */

describe('API contract smoke tests', () => {
  jest.setTimeout(20000);
  test('POST /api/v1/login -> 400 with Deprecation header', async () => {
    const res = await request(app)
      .post('/api/v1/login')
      .send({})
      .set('Content-Type', 'application/json');

    expect([400, 422]).toContain(res.status);
    // 在非生产环境应含弃用头
    if (process.env.NODE_ENV !== 'production') {
      expect(res.headers['deprecation']).toBeDefined();
      expect(res.headers['link']).toContain('/api/v1/auth/login');
    }
  });

  test('POST /api/v1/auth/login -> 400 without Deprecation', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({})
      .set('Content-Type', 'application/json');

    expect([400, 422]).toContain(res.status);
    expect(res.headers['deprecation']).toBeUndefined();
  });

  test('GET /nonexistent -> 404 JSON error', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body).toBeDefined();
    expect(res.body.success).toBe(false);
  });

  test('POST /api/v1/questions/upload without token -> 401', async () => {
    const res = await request(app)
      .post('/api/v1/questions/upload');
    expect([400, 401]).toContain(res.status);
  });
});
