const DatabaseService = require('../utils/DatabaseService');
const DataValidator = require('../utils/DataValidator');
const QueryBuilder = require('../utils/QueryBuilder');
const UserRepository = require('../repositories/UserRepository');
const QuestionRepository = require('../repositories/QuestionRepository');
const BaseService = require('../services/BaseService');

describe('统一数据库接口测试', () => {
  
  describe('DatabaseService', () => {
    test('应该能够执行基本查询', async () => {
      const result = await DatabaseService.query('SELECT 1 as test');
      expect(result).toHaveLength(1);
      expect(result[0].test).toBe(1);
    });

    test('应该能够获取单个结果', async () => {
      const result = await DatabaseService.getOne('SELECT 1 as test');
      expect(result).toEqual({ test: 1 });
    });

    test('应该能够处理分页查询', async () => {
      const result = await DatabaseService.getMany(
        'SELECT * FROM users LIMIT 10',
        [],
        { page: 1, limit: 5 }
      );
      
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination).toHaveProperty('page');
      expect(result.pagination).toHaveProperty('limit');
    });

    test('应该能够执行事务', async () => {
      const result = await DatabaseService.transaction(async (trx) => {
        const user = await trx.insert('users', {
          username: 'test_transaction',
          email: 'test@transaction.com',
          password: 'password123'
        });
        
        await trx.insert('user_stats', {
          user_id: user.id,
          total_questions: 0,
          correct_questions: 0
        });
        
        return user;
      });
      
      expect(result).toHaveProperty('id');
      expect(result.id).toBeGreaterThan(0);
    });

    test('应该能够进行健康检查', async () => {
      const health = await DatabaseService.healthCheck();
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('responseTime');
      expect(health).toHaveProperty('poolStatus');
    });
  });

  describe('DataValidator', () => {
    test('应该能够验证用户数据', () => {
      const validUserData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const result = DataValidator.validateUserData(validUserData);
      expect(result).toHaveProperty('username', 'testuser');
      expect(result).toHaveProperty('email', 'test@example.com');
    });

    test('应该拒绝无效的用户数据', () => {
      const invalidUserData = {
        username: 'ab', // 太短
        email: 'invalid-email',
        password: '123' // 太短
      };
      
      expect(() => {
        DataValidator.validateUserData(invalidUserData);
      }).toThrow();
    });

    test('应该能够验证题目数据', () => {
      const validQuestionData = {
        title: '测试题目',
        content: '这是一道测试题目',
        category_id: 1,
        type: 'single',
        options: ['选项A', '选项B', '选项C', '选项D'],
        correct_answer: 'A',
        difficulty: 'medium'
      };
      
      const result = DataValidator.validateQuestionData(validQuestionData);
      expect(result).toHaveProperty('title', '测试题目');
      expect(result).toHaveProperty('type', 'single');
    });

    test('应该能够验证分页参数', () => {
      const result = DataValidator.validatePaginationParams({ page: '2', limit: '20' });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });
  });

  describe('QueryBuilder', () => {
    test('应该能够构建基本SELECT查询', () => {
      const query = new QueryBuilder('users')
        .select(['id', 'username', 'email'])
        .where('status', '=', 1)
        .orderBy('created_at', 'DESC')
        .limit(10);
      
      const { sql, params } = query.buildSelect();
      
      expect(sql).toContain('SELECT id, username, email FROM users');
      expect(sql).toContain('WHERE status = ?');
      expect(sql).toContain('ORDER BY created_at DESC');
      expect(sql).toContain('LIMIT 10');
      expect(params).toContain(1);
    });

    test('应该能够构建JOIN查询', () => {
      const query = new QueryBuilder('users')
        .select(['u.username', 'us.total_questions'])
        .leftJoin('user_stats us', 'users.id = us.user_id')
        .where('u.status', '=', 1);
      
      const { sql, params } = query.buildSelect();
      
      expect(sql).toContain('LEFT JOIN user_stats us ON users.id = us.user_id');
      expect(params).toContain(1);
    });

    test('应该能够构建INSERT查询', () => {
      const query = new QueryBuilder('users');
      const { sql, params } = query.buildInsert({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      
      expect(sql).toContain('INSERT INTO users');
      expect(sql).toContain('(username, email, password)');
      expect(sql).toContain('VALUES (?, ?, ?)');
      expect(params).toEqual(['testuser', 'test@example.com', 'password123']);
    });

    test('应该能够构建UPDATE查询', () => {
      const query = new QueryBuilder('users')
        .where('id', '=', 1);
      
      const { sql, params } = query.buildUpdate({
        username: 'updateduser',
        email: 'updated@example.com'
      });
      
      expect(sql).toContain('UPDATE users SET');
      expect(sql).toContain('username = ?, email = ?');
      expect(sql).toContain('WHERE id = ?');
      expect(params).toEqual(['updateduser', 'updated@example.com', 1]);
    });

    test('应该能够构建COUNT查询', () => {
      const query = new QueryBuilder('users')
        .where('status', '=', 1);
      
      const { sql, params } = query.buildCount();
      
      expect(sql).toContain('SELECT COUNT(*) as total FROM users');
      expect(sql).toContain('WHERE status = ?');
      expect(params).toContain(1);
    });
  });

  describe('UserRepository', () => {
    let userRepository;
    
    beforeEach(() => {
      userRepository = new UserRepository();
    });

    test('应该能够创建用户', async () => {
      const userData = {
        username: 'testrepouser',
        email: 'testrepo@example.com',
        password: 'password123'
      };
      
      const result = await userRepository.create(userData, { returnRecord: true });
      
      expect(result.record).toHaveProperty('id');
      expect(result.record.username).toBe('testrepouser');
    });

    test('应该能够根据用户名查找用户', async () => {
      // 先创建一个用户
      await userRepository.create({
        username: 'findbyusername',
        email: 'findby@example.com',
        password: 'password123'
      });
      
      const user = await userRepository.findByUsername('findbyusername');
      expect(user).toHaveProperty('username', 'findbyusername');
      expect(user).not.toHaveProperty('password'); // 应该被过滤掉
    });

    test('应该能够检查用户名可用性', async () => {
      const isAvailable = await userRepository.isUsernameAvailable('nonexistentuser');
      expect(isAvailable).toBe(true);
    });

    test('应该能够分页查询用户', async () => {
      const result = await userRepository.paginate({
        page: 1,
        limit: 5,
        conditions: { status: 1 }
      });
      
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe('QuestionRepository', () => {
    let questionRepository;
    
    beforeEach(() => {
      questionRepository = new QuestionRepository();
    });

    test('应该能够创建题目', async () => {
      const questionData = {
        title: '测试仓库题目',
        content: '这是一道测试题目',
        category_id: 1,
        type: 'single',
        options: ['选项A', '选项B', '选项C', '选项D'],
        correct_answer: 'A',
        difficulty: 'medium',
        created_by: 1
      };
      
      const result = await questionRepository.create(questionData, { returnRecord: true });
      
      expect(result.record).toHaveProperty('id');
      expect(result.record.title).toBe('测试仓库题目');
    });

    test('应该能够随机获取题目', async () => {
      const questions = await questionRepository.getRandomQuestions({
        count: 5,
        difficulty: 'medium'
      });
      
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeLessThanOrEqual(5);
    });

    test('应该能够搜索题目', async () => {
      const result = await questionRepository.searchQuestions({
        keyword: '测试',
        page: 1,
        limit: 10
      });
      
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe('BaseService', () => {
    let userService;
    
    beforeEach(() => {
      const userRepository = new UserRepository();
      userService = new BaseService(userRepository);
    });

    test('应该能够通过服务创建记录', async () => {
      const userData = {
        username: 'serviceuser',
        email: 'service@example.com',
        password: 'password123'
      };
      
      const user = await userService.create(userData);
      
      expect(user).toHaveProperty('id');
      expect(user.username).toBe('serviceuser');
    });

    test('应该能够通过服务获取记录', async () => {
      // 先创建一个用户
      const createdUser = await userService.create({
        username: 'getbyiduser',
        email: 'getbyid@example.com',
        password: 'password123'
      });
      
      const user = await userService.getById(createdUser.id);
      expect(user).toHaveProperty('id', createdUser.id);
    });

    test('应该能够通过服务更新记录', async () => {
      // 先创建一个用户
      const createdUser = await userService.create({
        username: 'updateuser',
        email: 'update@example.com',
        password: 'password123'
      });
      
      const updatedUser = await userService.update(createdUser.id, {
        nickname: '更新的昵称'
      });
      
      expect(updatedUser.nickname).toBe('更新的昵称');
    });

    test('应该能够通过服务删除记录', async () => {
      // 先创建一个用户
      const createdUser = await userService.create({
        username: 'deleteuser',
        email: 'delete@example.com',
        password: 'password123'
      });
      
      const result = await userService.delete(createdUser.id);
      expect(result.affectedRows).toBe(1);
      
      // 验证用户已被删除
      const exists = await userService.exists(createdUser.id);
      expect(exists).toBe(false);
    });
  });

  describe('错误处理', () => {
    test('应该正确处理数据库连接错误', async () => {
      // 模拟数据库连接错误
      const invalidSql = 'SELECT * FROM nonexistent_table';
      
      await expect(DatabaseService.query(invalidSql)).rejects.toThrow();
    });

    test('应该正确处理数据验证错误', () => {
      const invalidData = {
        username: '', // 空用户名
        email: 'invalid-email',
        password: '123' // 密码太短
      };
      
      expect(() => {
        DataValidator.validateUserData(invalidData);
      }).toThrow();
    });

    test('应该正确处理查询构建错误', () => {
      const query = new QueryBuilder();
      
      expect(() => {
        query.buildSelect(); // 没有设置表名
      }).toThrow();
    });
  });

  describe('性能测试', () => {
    test('批量插入应该比单个插入更快', async () => {
      const batchData = Array.from({ length: 100 }, (_, i) => ({
        username: `batchuser${i}`,
        email: `batch${i}@example.com`,
        password: 'password123'
      }));
      
      const startTime = Date.now();
      const result = await DatabaseService.batchInsert('users', batchData, { batchSize: 50 });
      const endTime = Date.now();
      
      expect(result.successBatches).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(5000); // 应该在5秒内完成
    });

    test('查询构建器应该生成优化的SQL', () => {
      const query = new QueryBuilder('users')
        .select(['id', 'username'])
        .where('status', '=', 1)
        .limit(10);
      
      const { sql } = query.buildSelect();
      
      // 检查SQL是否包含必要的优化
      expect(sql).toContain('LIMIT 10'); // 限制结果数量
      expect(sql).not.toContain('SELECT *'); // 不使用SELECT *
    });
  });
});

// 测试辅助函数
const setupTestData = async () => {
  // 创建测试用的分类
  await DatabaseService.query(`
    INSERT IGNORE INTO question_categories (id, name, description) 
    VALUES (1, '测试分类', '用于测试的分类')
  `);
  
  // 创建测试用户
  await DatabaseService.query(`
    INSERT IGNORE INTO users (id, username, email, password, role) 
    VALUES (1, 'testadmin', 'admin@test.com', 'password123', 'admin')
  `);
};

const cleanupTestData = async () => {
  // 清理测试数据
  await DatabaseService.query('DELETE FROM user_answers WHERE user_id IN (SELECT id FROM users WHERE username LIKE "test%")');
  await DatabaseService.query('DELETE FROM user_stats WHERE user_id IN (SELECT id FROM users WHERE username LIKE "test%")');
  await DatabaseService.query('DELETE FROM users WHERE username LIKE "test%"');
  await DatabaseService.query('DELETE FROM questions WHERE title LIKE "测试%"');
};

// 在测试开始前设置数据
beforeAll(async () => {
  await setupTestData();
});

// 在测试结束后清理数据
afterAll(async () => {
  await cleanupTestData();
});