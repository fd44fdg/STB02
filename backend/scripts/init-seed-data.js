/**
 * 数据库初始化和种子数据脚本
 * 用于全新环境的数据库初始化
 */

const { pool, query } = require('../config/database');
const bcrypt = require('bcryptjs');

// 导入数据生成器
const UserDataGenerator = require('./user-data-generator');
const QuestionDataGenerator = require('./question-data-generator');
const ArticleDataGenerator = require('./article-data-generator');

// 导入其他脚本
const { migrateEnhanced } = require('./migrate-enhanced');
const { initCategories } = require('./init-categories');

class SeedDataInitializer {
  constructor() {
    this.initLog = [];
  }

  /**
   * 执行完整的数据库初始化
   */
  async initialize() {
    console.log('🌱 开始数据库初始化和种子数据生成...');
    
    try {
      // 1. 检查数据库状态
      await this.checkDatabaseState();
      
      // 2. 创建基础表结构
      await this.createBaseTables();
      
      // 3. 执行增强迁移
      await this.enhanceDatabase();
      
      // 4. 初始化分类数据
      await this.initializeCategories();
      
      // 5. 生成种子数据
      await this.generateSeedData();
      
      // 6. 验证初始化结果
      await this.validateInitialization();
      
      console.log('✅ 数据库初始化完成');
      this.log('SUCCESS', '数据库初始化成功完成');
      
    } catch (error) {
      console.error('❌ 数据库初始化失败:', error.message);
      this.log('ERROR', `数据库初始化失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 检查数据库状态
   */
  async checkDatabaseState() {
    console.log('🔍 检查数据库状态...');
    
    try {
      // 检查数据库连接
      await query('SELECT 1');
      console.log('✅ 数据库连接正常');
      
      // 检查是否已有数据
      const tables = await query("SHOW TABLES");
      if (tables.length > 0) {
        console.log(`⚠️  数据库中已有 ${tables.length} 个表`);
        
        // 检查用户数据
        try {
          const userCount = await query('SELECT COUNT(*) as count FROM users');
          if (userCount[0].count > 0) {
            console.log(`⚠️  数据库中已有 ${userCount[0].count} 个用户`);
          }
        } catch (error) {
          // 用户表可能不存在，这是正常的
        }
      } else {
        console.log('✅ 数据库为空，可以进行初始化');
      }
      
      this.log('INFO', '数据库状态检查完成');
      
    } catch (error) {
      throw new Error(`数据库状态检查失败: ${error.message}`);
    }
  }

  /**
   * 创建基础表结构
   */
  async createBaseTables() {
    console.log('🏗️  创建基础表结构...');
    
    try {
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
      
      // 创建其他基础表
      await this.createOtherBaseTables();
      
      console.log('✅ 基础表结构创建完成');
      this.log('INFO', '基础表结构创建完成');
      
    } catch (error) {
      throw new Error(`基础表结构创建失败: ${error.message}`);
    }
  }

  /**
   * 创建其他基础表
   */
  async createOtherBaseTables() {
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
    
    console.log('✅ 其他基础表创建成功');
  }

  /**
   * 增强数据库结构
   */
  async enhanceDatabase() {
    console.log('🔧 增强数据库结构...');
    
    try {
      await migrateEnhanced();
      console.log('✅ 数据库结构增强完成');
      this.log('INFO', '数据库结构增强完成');
    } catch (error) {
      throw new Error(`数据库结构增强失败: ${error.message}`);
    }
  }

  /**
   * 初始化分类数据
   */
  async initializeCategories() {
    console.log('📂 初始化分类数据...');
    
    try {
      await initCategories();
      console.log('✅ 分类数据初始化完成');
      this.log('INFO', '分类数据初始化完成');
    } catch (error) {
      throw new Error(`分类数据初始化失败: ${error.message}`);
    }
  }

  /**
   * 生成种子数据
   */
  async generateSeedData() {
    console.log('🌱 生成种子数据...');
    
    try {
      // 生成管理员账户
      await this.generateAdminUser();
      
      // 生成示例用户
      await this.generateSampleUsers();
      
      // 生成题目数据
      await this.generateQuestions();
      
      // 生成文章数据
      await this.generateArticles();
      
      // 生成系统配置
      await this.generateSystemSettings();
      
      console.log('✅ 种子数据生成完成');
      this.log('INFO', '种子数据生成完成');
      
    } catch (error) {
      throw new Error(`种子数据生成失败: ${error.message}`);
    }
  }

  /**
   * 生成管理员账户
   */
  async generateAdminUser() {
    console.log('👑 生成管理员账户...');
    
    try {
      // 检查是否已有管理员
      const existingAdmin = await query('SELECT id FROM users WHERE role = "admin" LIMIT 1');
      if (existingAdmin.length > 0) {
        console.log('⚠️  管理员账户已存在，跳过创建');
        return;
      }
      
      // 创建默认管理员账户
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await query(`
        INSERT INTO users (
          username, email, password, role, nickname, level, points, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'admin',
        'admin@example.com',
        hashedPassword,
        'admin',
        '系统管理员',
        10,
        1000,
        1
      ]);
      
      console.log('✅ 管理员账户创建成功: admin / admin123');
      
    } catch (error) {
      console.error('❌ 管理员账户创建失败:', error.message);
    }
  }

  /**
   * 生成示例用户
   */
  async generateSampleUsers() {
    console.log('👥 生成示例用户...');
    
    try {
      const generator = new UserDataGenerator();
      const users = await generator.generateSampleUsers(10); // 生成10个示例用户
      
      console.log(`✅ 示例用户生成完成: ${users.length} 个用户`);
      
    } catch (error) {
      console.error('❌ 示例用户生成失败:', error.message);
      // 不抛出错误，允许继续执行
    }
  }

  /**
   * 生成题目数据
   */
  async generateQuestions() {
    console.log('❓ 生成题目数据...');
    
    try {
      const generator = new QuestionDataGenerator();
      const questions = await generator.generateAllQuestions();
      
      // 插入题目数据
      let insertedCount = 0;
      for (const question of questions) {
        try {
          await query(`
            INSERT INTO questions (
              title, content, type, difficulty, subject, options, correct_answer, 
              explanation, category_id, tags, knowledge_points, score, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            question.title,
            question.content,
            question.type,
            question.difficulty,
            question.subject,
            question.options,
            question.correct_answer,
            question.explanation,
            question.category_id || 1,
            question.tags,
            question.knowledge_points,
            question.score || 5,
            question.status || 1
          ]);
          insertedCount++;
        } catch (error) {
          console.error(`❌ 插入题目失败: ${question.title}`, error.message);
        }
      }
      
      console.log(`✅ 题目数据生成完成: ${insertedCount} 道题目`);
      
    } catch (error) {
      console.error('❌ 题目数据生成失败:', error.message);
      // 不抛出错误，允许继续执行
    }
  }

  /**
   * 生成文章数据
   */
  async generateArticles() {
    console.log('📄 生成文章数据...');
    
    try {
      const generator = new ArticleDataGenerator();
      const articles = await generator.generateAllArticles();
      
      // 获取默认作者ID
      const authorResult = await query('SELECT id FROM users WHERE role = "admin" LIMIT 1');
      const defaultAuthorId = authorResult.length > 0 ? authorResult[0].id : null;
      
      // 插入文章数据
      let insertedCount = 0;
      for (const article of articles) {
        try {
          await query(`
            INSERT INTO articles (
              title, content, author, author_id, category_id, 
              summary, cover, tags, views, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            article.title,
            article.content,
            article.author || 'System',
            defaultAuthorId,
            article.category_id || 1,
            article.summary || '',
            article.cover || '',
            JSON.stringify(article.tags || []),
            article.views || 0,
            article.status || 'published',
            new Date()
          ]);
          insertedCount++;
        } catch (error) {
          console.error(`❌ 插入文章失败: ${article.title}`, error.message);
        }
      }
      
      console.log(`✅ 文章数据生成完成: ${insertedCount} 篇文章`);
      
    } catch (error) {
      console.error('❌ 文章数据生成失败:', error.message);
      // 不抛出错误，允许继续执行
    }
  }

  /**
   * 生成系统配置
   */
  async generateSystemSettings() {
    console.log('⚙️  生成系统配置...');
    
    try {
      const settings = [
        {
          key: 'app_name',
          value: '掌上刷题宝',
          description: '应用名称'
        },
        {
          key: 'app_version',
          value: '1.0.0',
          description: '应用版本'
        },
        {
          key: 'daily_question_limit',
          value: '100',
          description: '每日答题限制'
        },
        {
          key: 'points_per_correct_answer',
          value: '5',
          description: '每道正确题目获得积分'
        },
        {
          key: 'checkin_points',
          value: '10',
          description: '每日签到获得积分'
        },
        {
          key: 'maintenance_mode',
          value: 'false',
          description: '维护模式开关'
        }
      ];
      
      for (const setting of settings) {
        try {
          await query(`
            INSERT INTO system_settings (setting_key, setting_value, description)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            setting_value = VALUES(setting_value),
            description = VALUES(description)
          `, [setting.key, setting.value, setting.description]);
        } catch (error) {
          console.error(`❌ 插入系统配置失败: ${setting.key}`, error.message);
        }
      }
      
      console.log(`✅ 系统配置生成完成: ${settings.length} 项配置`);
      
    } catch (error) {
      console.error('❌ 系统配置生成失败:', error.message);
      // 不抛出错误，允许继续执行
    }
  }

  /**
   * 验证初始化结果
   */
  async validateInitialization() {
    console.log('🔍 验证初始化结果...');
    
    try {
      // 验证表存在性
      const tables = await query("SHOW TABLES");
      console.log(`✅ 数据库表数量: ${tables.length}`);
      
      // 验证数据数量
      const userCount = await query('SELECT COUNT(*) as count FROM users');
      const questionCount = await query('SELECT COUNT(*) as count FROM questions');
      const articleCount = await query('SELECT COUNT(*) as count FROM articles');
      const categoryCount = await query('SELECT COUNT(*) as count FROM question_categories');
      
      console.log(`📊 初始化数据统计:`);
      console.log(`   - 用户数量: ${userCount[0].count}`);
      console.log(`   - 题目数量: ${questionCount[0].count}`);
      console.log(`   - 文章数量: ${articleCount[0].count}`);
      console.log(`   - 分类数量: ${categoryCount[0].count}`);
      
      // 验证管理员账户
      const adminCount = await query('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
      if (adminCount[0].count === 0) {
        throw new Error('没有管理员账户');
      }
      
      console.log('✅ 初始化验证通过');
      this.log('INFO', '初始化验证通过');
      
    } catch (error) {
      throw new Error(`初始化验证失败: ${error.message}`);
    }
  }

  /**
   * 记录日志
   */
  log(level, message) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message
    };
    
    this.initLog.push(logEntry);
  }

  /**
   * 获取初始化日志
   */
  getInitLog() {
    return this.initLog;
  }
}

// 执行初始化
if (require.main === module) {
  const initializer = new SeedDataInitializer();
  
  initializer.initialize()
    .then(() => {
      console.log('🎉 数据库初始化流程完成');
      
      // 显示初始化日志
      const logs = initializer.getInitLog();
      console.log('\n📋 初始化日志:');
      logs.forEach(log => {
        console.log(`[${log.timestamp}] ${log.level}: ${log.message}`);
      });
      
      pool.end();
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 数据库初始化失败:', error);
      
      // 显示初始化日志
      const logs = initializer.getInitLog();
      console.log('\n📋 初始化日志:');
      logs.forEach(log => {
        console.log(`[${log.timestamp}] ${log.level}: ${log.message}`);
      });
      
      pool.end();
      process.exit(1);
    });
}

module.exports = { SeedDataInitializer };