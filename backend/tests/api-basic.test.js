const request = require('supertest');
const express = require('express');

// 创建一个简单的Express应用用于测试路由配置
const app = express();
app.use(express.json());

// 简单的测试路由
app.get('/api/v1/test', (req, res) => {
  res.json({ message: 'API测试成功', status: 'ok' });
});

app.post('/api/v1/test', (req, res) => {
  res.json({ message: '数据接收成功', data: req.body });
});

describe('API基础测试', () => {
  test('GET /api/v1/test - 应该返回成功消息', async () => {
    const response = await request(app)
      .get('/api/v1/test')
      .expect(200);
    
    expect(response.body.message).toBe('API测试成功');
    expect(response.body.status).toBe('ok');
  });

  test('POST /api/v1/test - 应该接收并返回数据', async () => {
    const testData = { name: '测试用户', email: 'test@example.com' };
    
    const response = await request(app)
      .post('/api/v1/test')
      .send(testData)
      .expect(200);
    
    expect(response.body.message).toBe('数据接收成功');
    expect(response.body.data).toEqual(testData);
  });

  test('GET /api/v1/nonexistent - 应该返回404', async () => {
    await request(app)
      .get('/api/v1/nonexistent')
      .expect(404);
  });
});