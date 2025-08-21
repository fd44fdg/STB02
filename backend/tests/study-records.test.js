const request = require('supertest');
const app = require('../server');

describe('学习记录模块测试', () => {
  let userToken;
  let testUser;
  let testQuestion;
  let testQuestion2;
  let testArticle;

  beforeEach(async () => {
    // 创建测试用户
    testUser = await global.testUtils.createTestUser({
      username: 'studyuser',
      email: 'studyuser@example.com',
      role: 'user'
    });

    // 获取用户token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'studyuser',
        password: 'password123'
      });
    userToken = loginResponse.body.data.token;

    // 创建测试题目
    testQuestion = await global.testUtils.createTestQuestion({
      title: '测试题目1',
      content: '这是第一道测试题目',
      type: 'single_choice',
      options: JSON.stringify([
        { key: 'A', value: '选项A' },
        { key: 'B', value: '选项B' },
        { key: 'C', value: '选项C' },
        { key: 'D', value: '选项D' }
      ]),
      correct_answer: 'A',
      explanation: '正确答案是A',
      difficulty: 'easy',
      subject: 'math'
    });

    testQuestion2 = await global.testUtils.createTestQuestion({
      title: '测试题目2',
      content: '这是第二道测试题目',
      type: 'single_choice',
      options: JSON.stringify([
        { key: 'A', value: '选项A' },
        { key: 'B', value: '选项B' },
        { key: 'C', value: '选项C' },
        { key: 'D', value: '选项D' }
      ]),
      correct_answer: 'B',
      explanation: '正确答案是B',
      difficulty: 'medium',
      subject: 'english'
    });
  });

  describe('题目收藏功能', () => {
    describe('POST /api/v1/study/favorites/:questionId', () => {
      test('用户应该能够收藏题目', async () => {
        const response = await request(app)
          .post(`/api/v1/study/favorites/${testQuestion.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('收藏成功');
      });

      test('应该返回404当题目不存在', async () => {
        const response = await request(app)
          .post('/api/v1/study/favorites/99999')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('题目不存在');
      });

      test('重复收藏应该返回提示', async () => {
        // 先收藏一次
        await request(app)
          .post(`/api/v1/study/favorites/${testQuestion.id}`)
          .set('Authorization', `Bearer ${userToken}`);

        // 再次收藏
        const response = await request(app)
          .post(`/api/v1/study/favorites/${testQuestion.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('已经收藏过了');
      });
    });

    describe('DELETE /api/v1/study/favorites/:questionId', () => {
      beforeEach(async () => {
        // 先收藏题目
        await request(app)
          .post(`/api/v1/study/favorites/${testQuestion.id}`)
          .set('Authorization', `Bearer ${userToken}`);
      });

      test('用户应该能够取消收藏题目', async () => {
        const response = await request(app)
          .delete(`/api/v1/study/favorites/${testQuestion.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('取消收藏成功');
      });

      test('应该返回404当题目不存在', async () => {
        const response = await request(app)
          .delete('/api/v1/study/favorites/99999')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('题目不存在');
      });
    });

    describe('GET /api/v1/study/favorites', () => {
      beforeEach(async () => {
        // 收藏几道题目
        await request(app)
          .post(`/api/v1/study/favorites/${testQuestion.id}`)
          .set('Authorization', `Bearer ${userToken}`);
        await request(app)
          .post(`/api/v1/study/favorites/${testQuestion2.id}`)
          .set('Authorization', `Bearer ${userToken}`);
      });

      test('应该返回用户收藏的题目列表', async () => {
        const response = await request(app)
          .get('/api/v1/study/favorites')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toBeInstanceOf(Array);
        expect(response.body.data.items.length).toBeGreaterThan(0);
        expect(response.body.data.items[0]).toHaveProperty('id');
        expect(response.body.data.items[0]).toHaveProperty('title');
        expect(response.body.data.items[0]).toHaveProperty('difficulty');
        expect(response.body.data.items[0]).toHaveProperty('subject');
      });

      test('应该支持分页', async () => {
        const response = await request(app)
          .get('/api/v1/study/favorites?page=1&limit=1')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items.length).toBeLessThanOrEqual(1);
        expect(response.body.data.total).toBeGreaterThan(0);
      });
    });

    describe('GET /api/v1/study/favorites/check/:questionId', () => {
      test('应该返回题目收藏状态', async () => {
        // 先收藏题目
        await request(app)
          .post(`/api/v1/study/favorites/${testQuestion.id}`)
          .set('Authorization', `Bearer ${userToken}`);

        const response = await request(app)
          .get(`/api/v1/study/favorites/check/${testQuestion.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isFavorited).toBe(true);
      });

      test('未收藏的题目应该返回false', async () => {
        const response = await request(app)
          .get(`/api/v1/study/favorites/check/${testQuestion.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isFavorited).toBe(false);
      });
    });
  });

  describe('错题管理功能', () => {
    beforeEach(async () => {
      // 提交错误答案，生成错题记录
      await request(app)
        .post('/api/v1/study/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          questionId: testQuestion.id,
          userAnswer: 'B', // 错误答案
          timeSpent: 30
        });
    });

    describe('GET /api/v1/study/wrong-questions', () => {
      test('应该返回用户的错题列表', async () => {
        const response = await request(app)
          .get('/api/v1/study/wrong-questions')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toBeInstanceOf(Array);
        expect(response.body.data.items.length).toBeGreaterThan(0);
        expect(response.body.data.items[0]).toHaveProperty('questionId');
        expect(response.body.data.items[0]).toHaveProperty('title');
        expect(response.body.data.items[0]).toHaveProperty('status');
        expect(response.body.data.items[0]).toHaveProperty('wrongCount');
      });

      test('应该支持按状态筛选', async () => {
        const response = await request(app)
          .get('/api/v1/study/wrong-questions?status=unmastered')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toBeInstanceOf(Array);
        if (response.body.data.items.length > 0) {
          expect(response.body.data.items[0].status).toBe('unmastered');
        }
      });

      test('应该支持分页', async () => {
        const response = await request(app)
          .get('/api/v1/study/wrong-questions?page=1&limit=5')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items.length).toBeLessThanOrEqual(5);
      });
    });

    describe('PUT /api/v1/study/wrong-questions/:questionId/status', () => {
      test('应该能够标记错题为已掌握', async () => {
        const response = await request(app)
          .put(`/api/v1/study/wrong-questions/${testQuestion.id}/status`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ status: 'mastered' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('状态更新成功');
      });

      test('应该验证状态值', async () => {
        const response = await request(app)
          .put(`/api/v1/study/wrong-questions/${testQuestion.id}/status`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ status: 'invalid_status' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('状态值无效');
      });

      test('应该返回404当错题记录不存在', async () => {
        const response = await request(app)
          .put(`/api/v1/study/wrong-questions/${testQuestion2.id}/status`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ status: 'mastered' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('错题记录不存在');
      });
    });
  });

  describe('学习记录和提交功能', () => {
    describe('POST /api/v1/study/submit', () => {
      test('应该能够提交正确答案', async () => {
        const response = await request(app)
          .post('/api/v1/study/submit')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            questionId: testQuestion.id,
            userAnswer: 'A', // 正确答案
            timeSpent: 25
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isCorrect).toBe(true);
        expect(response.body.data.correctAnswer).toBe('A');
        expect(response.body.data.explanation).toBe('正确答案是A');
      });

      test('应该能够提交错误答案', async () => {
        const response = await request(app)
          .post('/api/v1/study/submit')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            questionId: testQuestion.id,
            userAnswer: 'B', // 错误答案
            timeSpent: 30
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isCorrect).toBe(false);
        expect(response.body.data.correctAnswer).toBe('A');
        expect(response.body.data.explanation).toBe('正确答案是A');
      });

      test('应该验证必填字段', async () => {
        const response = await request(app)
          .post('/api/v1/study/submit')
          .set('Authorization', `Bearer ${userToken}`)
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('题目ID和用户答案不能为空');
      });

      test('应该返回404当题目不存在', async () => {
        const response = await request(app)
          .post('/api/v1/study/submit')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            questionId: 99999,
            userAnswer: 'A',
            timeSpent: 30
          })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('题目不存在');
      });
    });

    describe('GET /api/v1/study/records', () => {
      beforeEach(async () => {
        // 提交几次答题记录
        await request(app)
          .post('/api/v1/study/submit')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            questionId: testQuestion.id,
            userAnswer: 'A',
            timeSpent: 25
          });

        await request(app)
          .post('/api/v1/study/submit')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            questionId: testQuestion2.id,
            userAnswer: 'C',
            timeSpent: 35
          });
      });

      test('应该返回用户的学习记录', async () => {
        const response = await request(app)
          .get('/api/v1/study/records')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toBeInstanceOf(Array);
        expect(response.body.data.items.length).toBeGreaterThan(0);
        expect(response.body.data.items[0]).toHaveProperty('questionId');
        expect(response.body.data.items[0]).toHaveProperty('userAnswer');
        expect(response.body.data.items[0]).toHaveProperty('isCorrect');
        expect(response.body.data.items[0]).toHaveProperty('timeSpent');
        expect(response.body.data.items[0]).toHaveProperty('createdAt');
      });

      test('应该支持按日期筛选', async () => {
        const today = new Date().toISOString().split('T')[0];
        const response = await request(app)
          .get(`/api/v1/study/records?date=${today}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toBeInstanceOf(Array);
      });

      test('应该支持分页', async () => {
        const response = await request(app)
          .get('/api/v1/study/records?page=1&limit=1')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items.length).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('学习统计功能', () => {
    beforeEach(async () => {
      // 提交一些答题记录以生成统计数据
      await request(app)
        .post('/api/v1/study/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          questionId: testQuestion.id,
          userAnswer: 'A', // 正确
          timeSpent: 25
        });

      await request(app)
        .post('/api/v1/study/submit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          questionId: testQuestion2.id,
          userAnswer: 'C', // 错误
          timeSpent: 35
        });
    });

    describe('GET /api/v1/study/stats', () => {
      test('应该返回用户的学习统计', async () => {
        const response = await request(app)
          .get('/api/v1/study/stats')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('totalCorrect');
        expect(response.body.data).toHaveProperty('totalQuestions');
        expect(response.body.data).toHaveProperty('totalStudyTime');
        expect(response.body.data).toHaveProperty('studyDays');
        expect(response.body.data).toHaveProperty('accuracy');
        expect(typeof response.body.data.totalCorrect).toBe('number');
        expect(typeof response.body.data.totalQuestions).toBe('number');
        expect(typeof response.body.data.totalStudyTime).toBe('number');
        expect(typeof response.body.data.studyDays).toBe('number');
        expect(typeof response.body.data.accuracy).toBe('number');
      });
    });

    describe('GET /api/v1/study/history', () => {
      test('应该返回用户的答题历史', async () => {
        const response = await request(app)
          .get('/api/v1/study/history')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toBeInstanceOf(Array);
        expect(response.body.data.items.length).toBeGreaterThan(0);
        expect(response.body.data.items[0]).toHaveProperty('questionId');
        expect(response.body.data.items[0]).toHaveProperty('questionTitle');
        expect(response.body.data.items[0]).toHaveProperty('userAnswer');
        expect(response.body.data.items[0]).toHaveProperty('correctAnswer');
        expect(response.body.data.items[0]).toHaveProperty('isCorrect');
        expect(response.body.data.items[0]).toHaveProperty('timeSpent');
      });

      test('应该支持分页', async () => {
        const response = await request(app)
          .get('/api/v1/study/history?page=1&limit=1')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items.length).toBeLessThanOrEqual(1);
        expect(response.body.data.total).toBeGreaterThan(0);
      });
    });
  });

  describe('考试模式功能', () => {
    describe('POST /api/v1/study/exam', () => {
      test('应该能够创建考试', async () => {
        const examData = {
          questionCount: 2,
          category: 'math',
          difficulty: 'easy'
        };

        const response = await request(app)
          .post('/api/v1/study/exam')
          .set('Authorization', `Bearer ${userToken}`)
          .send(examData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('examId');
        expect(response.body.data).toHaveProperty('questions');
        expect(response.body.data.questions).toBeInstanceOf(Array);
        expect(response.body.data.questions.length).toBeLessThanOrEqual(examData.questionCount);
      });

      test('应该验证题目数量', async () => {
        const response = await request(app)
          .post('/api/v1/study/exam')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ questionCount: 0 })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('题目数量必须大于0');
      });
    });

    describe('POST /api/v1/study/exam/:id/submit', () => {
      let examId;

      beforeEach(async () => {
        // 创建考试
        const examResponse = await request(app)
          .post('/api/v1/study/exam')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            questionCount: 2,
            category: 'math'
          });
        examId = examResponse.body.data.examId;
      });

      test('应该能够提交考试答案', async () => {
        const answers = [
          { questionId: testQuestion.id, answer: 'A' },
          { questionId: testQuestion2.id, answer: 'B' }
        ];

        const response = await request(app)
          .post(`/api/v1/study/exam/${examId}/submit`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ answers })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('score');
        expect(response.body.data).toHaveProperty('totalQuestions');
        expect(response.body.data).toHaveProperty('correctCount');
        expect(response.body.data).toHaveProperty('results');
        expect(response.body.data.results).toBeInstanceOf(Array);
        expect(typeof response.body.data.score).toBe('number');
      });

      test('应该验证答案格式', async () => {
        const response = await request(app)
          .post(`/api/v1/study/exam/${examId}/submit`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('答案不能为空');
      });

      test('应该返回404当考试不存在', async () => {
        const response = await request(app)
          .post('/api/v1/study/exam/99999/submit')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ answers: [] })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('考试不存在');
      });
    });
  });

  describe('文章收藏功能', () => {
    beforeEach(async () => {
      // 创建测试文章（这里假设有文章创建的API）
      // 实际实现中可能需要先创建文章分类和文章
    });

    describe('GET /study/articles/favorites', () => {
      test('应该返回用户收藏的文章列表', async () => {
        const response = await request(app)
          .get('/study/articles/favorites')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toBeInstanceOf(Array);
        expect(response.body.data.total).toBeGreaterThanOrEqual(0);
      });

      test('应该支持分页', async () => {
        const response = await request(app)
          .get('/study/articles/favorites?page=1&limit=5')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items.length).toBeLessThanOrEqual(5);
      });
    });

    // 注意：文章收藏和检查功能的测试需要先有文章数据
    // 这里提供测试框架，实际运行时需要确保有相应的文章数据
  });
});