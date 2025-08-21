/**
 * 完整数据库设置脚本
 * 包含原始表创建、结构扩展和初始数据
 */

const { pool, query } = require('../config/database');
const { migrateEnhanced } = require('./migrate-enhanced');
const { initCategories } = require('./init-categories');
const UserDataGenerator = require('./user-data-generator');

async function setupDatabase() {
  console.log('开始完整数据库设置...');
  
  try {
    // 1. 执行原始迁移（创建基础表）
    console.log('步骤 1: 创建基础表结构...');
    await createBaseTables();
    
    // 2. 执行增强迁移（扩展表结构）
    console.log('步骤 2: 扩展表结构...');
    await migrateEnhanced();
    
    // 3. 初始化分类数据
    console.log('步骤 3: 初始化分类数据...');
    await initCategories();
    
    // 4. 初始化用户数据
    console.log('步骤 4: 初始化用户数据...');
    await initUserData();
    
    // 5. 验证数据库完整性
    console.log('步骤 5: 验证数据库完整性...');
    await validateDatabase();
    
    console.log('✅ 完整数据库设置完成');
    
  } catch (error) {
    console.error('❌ 数据库设置失败:', error.message);
    throw error;
  }
}

async function createBaseTables() {
  // 创建用户表
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) UNIQUE,
      password VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      avatar VARCHAR(255),
      openid VARCHAR(100) UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_username (username),
      INDEX idx_email (email),
      INDEX idx_openid (openid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ 用户表创建成功');
  
  // 创建题目表
  await query(`
    CREATE TABLE IF NOT EXISTS questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      type VARCHAR(20) NOT NULL,
      difficulty VARCHAR(20) NOT NULL,
      subject VARCHAR(50) NOT NULL,
      options JSON,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_subject (subject),
      INDEX idx_difficulty (difficulty),
      INDEX idx_type (type),
      FULLTEXT idx_content (title, content)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ 题目表创建成功');
  
  // 创建收藏表
  await query(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      question_id INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_favorite (user_id, question_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_question_id (question_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ 收藏表创建成功');
  
  // 创建错题表
  await query(`
    CREATE TABLE IF NOT EXISTS wrong_questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      question_id INT NOT NULL,
      user_answer TEXT,
      is_mastered BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_wrong_question (user_id, question_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_question_id (question_id),
      INDEX idx_is_mastered (is_mastered)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ 错题表创建成功');
  
  // 创建学习记录表
  await query(`
    CREATE TABLE IF NOT EXISTS study_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      date DATE NOT NULL,
      questions_count INT NOT NULL DEFAULT 0,
      correct_count INT NOT NULL DEFAULT 0,
      wrong_count INT NOT NULL DEFAULT 0,
      study_time INT NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_study_record (user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_date (date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ 学习记录表创建成功');
  
  // 创建文章表
  await query(`
    CREATE TABLE IF NOT EXISTS articles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      author VARCHAR(100) NOT NULL,
      cover_image VARCHAR(255),
      category VARCHAR(50) NOT NULL,
      tags JSON,
      view_count INT NOT NULL DEFAULT 0,
      like_count INT NOT NULL DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_status (status),
      FULLTEXT idx_article_content (title, content)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ 文章表创建成功');
  
  // 创建系统配置表
  await query(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value TEXT NOT NULL,
      description VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_setting_key (setting_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ 系统配置表创建成功');
}

async function initUserData() {
  try {
    // 使用用户数据生成器初始化用户数据
    const generator = new UserDataGenerator();
    const users = await generator.generateAllUserData();
    
    console.log(`✅ 用户数据初始化完成:`);
    console.log(`   - 管理员账户: ${users.filter(u => u.role === 'admin').length} 个`);
    console.log(`   - 示例用户账户: ${users.filter(u => u.role === 'user').length} 个`);
    
  } catch (error) {
    console.error('❌ 用户数据初始化失败:', error.message);
    // 不抛出错误，允许其他步骤继续执行
  }
}

async function validateDatabase() {
  console.log('验证数据库表结构...');
  
  // 验证主要表是否存在
  const tables = [
    'users', 'questions', 'articles', 'favorites', 'wrong_questions', 
    'study_records', 'system_settings', 'question_categories', 
    'article_categories', 'user_stats', 'user_checkins', 'user_answers'
  ];
  
  for (const table of tables) {
    const result = await query(`SHOW TABLES LIKE '${table}'`);
    if (result.length > 0) {
      console.log(`✅ 表 ${table} 存在`);
    } else {
      console.log(`❌ 表 ${table} 不存在`);
    }
  }
  
  // 验证分类数据
  const questionCategoriesCount = await query(`SELECT COUNT(*) as count FROM question_categories`);
  const articleCategoriesCount = await query(`SELECT COUNT(*) as count FROM article_categories`);
  
  console.log(`✅ 题目分类数量: ${questionCategoriesCount[0].count}`);
  console.log(`✅ 文章分类数量: ${articleCategoriesCount[0].count}`);
  
  // 验证用户数据
  const usersCount = await query(`SELECT COUNT(*) as count FROM users`);
  console.log(`✅ 用户数量: ${usersCount[0].count}`);
}

// 执行完整设置
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ 数据库完整设置完成');
      pool.end();
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 设置过程中发生错误:', error);
      pool.end();
      process.exit(1);
    });
}

module.exports = { setupDatabase };