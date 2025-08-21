const request = require('supertest');
const app = require('../server');

describe('文章管理模块测试', () => {
  let adminToken;
  let userToken;
  let testAdmin;
  let testUser;
  let testCategory;
  let testArticle;

  beforeEach(async () => {
    // 创建管理员用户
    testAdmin = await global.testUtils.createTestUser({
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin'
    });

    // 创建普通用户
    testUser = await global.testUtils.createTestUser({
      username: 'user',
      email: 'user@example.com',
      role: 'user'
    });

    // 获取管理员token
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'password123'
      });
    adminToken = adminLoginResponse.body.data.token;

    // 获取用户token
    const userLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'user',
        password: 'password123'
      });
    userToken = userLoginResponse.body.data.token;

    // 创建测试分类
    const categoryResponse = await request(app)
      .post('/api/content/articles/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: '测试分类',
        description: '用于测试的文章分类',
        slug: 'test-category'
      });
    testCategory = categoryResponse.body.data;
  });

  describe('文章分类管理', () => {
    describe('GET /api/content/articles/categories', () => {
      test('应该返回文章分类列表', async () => {
        const response = await request(app)
          .get('/api/content/articles/categories')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toBeInstanceOf(Array);
        expect(response.body.data.items.length).toBeGreaterThan(0);
        expect(response.body.data.items[0]).toHaveProperty('name');
        expect(response.body.data.items[0]).toHaveProperty('slug');
      });
    });

    describe('POST /api/content/articles/categories', () => {
      test('管理员应该能够创建文章分类', async () => {
        const categoryData = {
          name: '新分类',
          description: '新分类描述',
          slug: 'new-category'
        };

        const response = await request(app)
          .post('/api/content/articles/categories')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(categoryData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(categoryData.name);
        expect(response.body.data.slug).toBe(categoryData.slug);
        expect(response.body.data.description).toBe(categoryData.description);
      });

      test('应该验证必填字段', async () => {
        const response = await request(app)
          .post('/api/content/articles/categories')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('分类名称和slug不能为空');
      });

      test('普通用户不应该能够创建分类', async () => {
        const categoryData = {
          name: '新分类',
          slug: 'new-category'
        };

        const response = await request(app)
          .post('/api/content/articles/categories')
          .set('Authorization', `Bearer ${userToken}`)
          .send(categoryData)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('PUT /api/content/articles/categories/:id', () => {
      test('管理员应该能够更新分类', async () => {
        const updateData = {
          name: '更新后的分类',
          description: '更新后的描述',
          slug: 'updated-category'
        };

        const response = await request(app)
          .put(`/api/content/articles/categories/${testCategory.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(updateData.name);
        expect(response.body.data.description).toBe(updateData.description);
      });

      test('应该返回404当分类不存在', async () => {
        const response = await request(app)
          .put('/api/content/articles/categories/99999')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: '新名称' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('分类不存在');
      });
    });

    describe('DELETE /api/content/articles/categories/:id', () => {
      test('管理员应该能够删除分类', async () => {
        const response = await request(app)
          .delete(`/api/content/articles/categories/${testCategory.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('分类删除成功');
      });

      test('应该返回404当分类不存在', async () => {
        const response = await request(app)
          .delete('/api/content/articles/categories/99999')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('分类不存在');
      });
    });
  });

  describe('文章管理', () => {
    beforeEach(async () => {
      // 创建测试文章
      const articleResponse = await request(app)
        .post('/api/content/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '测试文章',
          content: '这是一篇测试文章的内容',
          categoryId: testCategory.id,
          summary: '测试文章摘要',
          tags: ['测试', '文章']
        });
      testArticle = articleResponse.body.data;
    });

    describe('GET /api/content/articles', () => {
      test('应该返回文章列表', async () => {
        const response = await request(app)
          .get('/api/content/articles')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items).toBeInstanceOf(Array);
        expect(response.body.data.items.length).toBeGreaterThan(0);
        expect(response.body.data.items[0]).toHaveProperty('title');
        expect(response.body.data.items[0]).toHaveProperty('authorName');
        expect(response.body.data.items[0]).toHaveProperty('categoryName');
      });

      test('应该支持分页', async () => {
        const response = await request(app)
          .get('/api/content/articles?page=1&limit=5')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.items.length).toBeLessThanOrEqual(5);
        expect(response.body.data.total).toBeGreaterThan(0);
      });
    });

    describe('GET /api/content/articles/:id', () => {
      test('应该返回文章详情', async () => {
        const response = await request(app)
          .get(`/api/content/articles/${testArticle.id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testArticle.id);
        expect(response.body.data.title).toBe(testArticle.title);
        expect(response.body.data.content).toBe(testArticle.content);
        expect(response.body.data).toHaveProperty('authorName');
        expect(response.body.data).toHaveProperty('categoryName');
        expect(response.body.data).toHaveProperty('commentCount');
        expect(response.body.data).toHaveProperty('likeCount');
      });

      test('登录用户应该获得点赞和收藏状态', async () => {
        const response = await request(app)
          .get(`/api/content/articles/${testArticle.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('isLiked');
        expect(response.body.data).toHaveProperty('isFavorited');
        expect(typeof response.body.data.isLiked).toBe('boolean');
        expect(typeof response.body.data.isFavorited).toBe('boolean');
      });

      test('应该返回404当文章不存在', async () => {
        const response = await request(app)
          .get('/api/content/articles/99999')
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('文章不存在');
      });
    });

    describe('POST /api/content/articles', () => {
      test('管理员应该能够创建文章', async () => {
        const articleData = {
          title: '新文章',
          content: '新文章的内容',
          categoryId: testCategory.id,
          summary: '新文章摘要',
          tags: ['新', '文章']
        };

        const response = await request(app)
          .post('/api/content/articles')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(articleData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe(articleData.title);
        expect(response.body.data.content).toBe(articleData.content);
        expect(response.body.data.author_id).toBe(testAdmin.id);
      });

      test('应该验证必填字段', async () => {
        const response = await request(app)
          .post('/api/content/articles')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('标题、内容和分类ID不能为空');
      });

      test('普通用户不应该能够创建文章', async () => {
        const articleData = {
          title: '新文章',
          content: '新文章的内容',
          categoryId: testCategory.id
        };

        const response = await request(app)
          .post('/api/content/articles')
          .set('Authorization', `Bearer ${userToken}`)
          .send(articleData)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('文章互动功能', () => {
    beforeEach(async () => {
      // 创建测试文章
      const articleResponse = await request(app)
        .post('/api/content/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: '互动测试文章',
          content: '这是一篇用于测试互动功能的文章',
          categoryId: testCategory.id
        });
      testArticle = articleResponse.body.data;
    });

    describe('文章评论', () => {
      describe('GET /api/content/articles/:id/comments', () => {
        test('应该返回文章评论列表', async () => {
          const response = await request(app)
            .get(`/api/content/articles/${testArticle.id}/comments`)
            .expect(200);

          expect(response.body.success).toBe(true);
          expect(response.body.data.items).toBeInstanceOf(Array);
          expect(response.body.data.total).toBeGreaterThanOrEqual(0);
        });
      });

      describe('POST /api/content/articles/:id/comments', () => {
        test('登录用户应该能够发表评论', async () => {
          const commentData = {
            content: '这是一条测试评论'
          };

          const response = await request(app)
            .post(`/api/content/articles/${testArticle.id}/comments`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(commentData)
            .expect(201);

          expect(response.body.success).toBe(true);
          expect(response.body.data.content).toBe(commentData.content);
          expect(response.body.data.username).toBe(testUser.username);
        });

        test('应该验证评论内容', async () => {
          const response = await request(app)
            .post(`/api/content/articles/${testArticle.id}/comments`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({})
            .expect(400);

          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('评论内容不能为空');
        });

        test('应该返回404当文章不存在', async () => {
          const response = await request(app)
            .post('/api/content/articles/99999/comments')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ content: '测试评论' })
            .expect(404);

          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('关联的文章不存在');
        });
      });
    });

    describe('文章点赞', () => {
      describe('POST /api/content/articles/:id/like', () => {
        test('登录用户应该能够点赞文章', async () => {
          const response = await request(app)
            .post(`/api/content/articles/${testArticle.id}/like`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

          expect(response.body.success).toBe(true);
          expect(response.body.data.liked).toBe(true);
          expect(response.body.data.likeCount).toBeGreaterThan(0);
        });

        test('再次点赞应该取消点赞', async () => {
          // 先点赞
          await request(app)
            .post(`/api/content/articles/${testArticle.id}/like`)
            .set('Authorization', `Bearer ${userToken}`);

          // 再次点赞（取消）
          const response = await request(app)
            .post(`/api/content/articles/${testArticle.id}/like`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

          expect(response.body.success).toBe(true);
          expect(response.body.data.liked).toBe(false);
        });
      });
    });

    describe('文章收藏', () => {
      describe('POST /api/content/articles/:id/favorite', () => {
        test('登录用户应该能够收藏文章', async () => {
          const response = await request(app)
            .post(`/api/content/articles/${testArticle.id}/favorite`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

          expect(response.body.success).toBe(true);
          expect(response.body.data.favorited).toBe(true);
        });

        test('再次收藏应该取消收藏', async () => {
          // 先收藏
          await request(app)
            .post(`/api/content/articles/${testArticle.id}/favorite`)
            .set('Authorization', `Bearer ${userToken}`);

          // 再次收藏（取消）
          const response = await request(app)
            .post(`/api/content/articles/${testArticle.id}/favorite`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

          expect(response.body.success).toBe(true);
          expect(response.body.data.favorited).toBe(false);
        });
      });
    });
  });
});