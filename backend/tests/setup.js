const mysql = require('mysql2/promise');
const { pool } = require('../config/database');

// 测试数据库配置
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
process.env.PORT = '3001';

// 全局测试设置
beforeAll(async () => {
  // 初始化测试数据库连接
  console.log('🔧 初始化测试环境...');
  
  // 测试数据库连接
  try {
    const connection = await pool.getConnection();
    console.log('✅ 测试数据库连接成功');
    connection.release();
  } catch (error) {
    console.error('❌ 测试数据库连接失败:', error.message);
    throw error;
  }
}, 30000);

// 每个测试后清理数据
afterEach(async () => {
  // 清理测试数据（保留表结构）
  try {
    const connection = await pool.getConnection();
    try {
      await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
      await connection.execute('TRUNCATE TABLE user_study_records');
      await connection.execute('TRUNCATE TABLE user_wrong_questions');
      await connection.execute('TRUNCATE TABLE user_answers');
      await connection.execute('TRUNCATE TABLE user_favorites');
      await connection.execute('TRUNCATE TABLE user_stats');
      await connection.execute('TRUNCATE TABLE user_checkins');
      await connection.execute('TRUNCATE TABLE questions');
      await connection.execute('TRUNCATE TABLE users');
      await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.warn('清理测试数据时出现警告:', error.message);
  }
});

// 所有测试完成后清理
afterAll(async () => {
  console.log('🧹 测试完成，清理资源...');
  try {
    if (pool) {
      await pool.end();
      console.log('✅ 数据库连接池已关闭');
    }
  } catch (error) {
    console.warn('⚠️ 关闭数据库连接池时出现警告:', error.message);
  }
}, 30000);

// 测试工具函数 - 使用真实数据库
const createTestUser = async (userData = {}) => {
  const bcrypt = require('bcryptjs');
  
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
  };

  const user = { ...defaultUser, ...userData };
  const hashedPassword = await bcrypt.hash(user.password, 10);
  
  // 插入到真实数据库
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO users (username, email, password, role, avatar, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.username, user.email, hashedPassword, user.role, '/default-avatar.svg', 1]
    );
    user.id = result.insertId;
   } finally {
     connection.release();
   }
  return user;
};

const createTestQuestion = async (questionData = {}) => {
  const defaultQuestion = {
    title: '测试题目',
    content: '这是一个测试题目',
    type: 'single',
    options: ['选项A', '选项B', '选项C', '选项D'],
    correct_answer: ['A'],
    explanation: '这是解析',
    difficulty: 'medium',
    category_id: 1,
    tags: ['测试']
  };

  const question = { ...defaultQuestion, ...questionData };
  
  // 插入到真实数据库
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO questions (title, content, type, options, correct_answer, explanation, difficulty, category_id, tags, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        question.title, 
        question.content, 
        question.type, 
        JSON.stringify(question.options), 
        JSON.stringify(question.correct_answer), 
        question.explanation, 
        question.difficulty, 
        question.category_id, 
        JSON.stringify(question.tags),
        1 // 默认创建者ID
      ]
    );
    question.id = result.insertId;
  } finally {
    connection.release();
  }
  return question;
};

global.testUtils = {
  createTestUser,
  createTestQuestion
};

module.exports = {
  createTestUser,
  createTestQuestion
};