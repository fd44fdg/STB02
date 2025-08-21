/**
 * 增强数据库迁移脚本
 * 扩展现有表结构并创建新表以支持真实数据存储
 */

const { pool, query } = require('../config/database');
const config = require('../../config');

// 增强迁移函数
async function migrateEnhanced() {
  console.log('开始增强数据库迁移...');
  
  try {
    // 1. 扩展用户表结构
    console.log('扩展用户表结构...');
    
    // 检查并添加新字段到用户表
    const userColumns = [
      { name: 'nickname', type: 'VARCHAR(100)', comment: '用户昵称' },
      { name: 'gender', type: 'ENUM("male", "female", "other")', comment: '性别' },
      { name: 'birthday', type: 'DATE', comment: '生日' },
      { name: 'bio', type: 'TEXT', comment: '个人简介' },
      { name: 'learning_goal', type: 'TEXT', comment: '学习目标' },
      { name: 'level', type: 'INT DEFAULT 1', comment: '用户等级' },
      { name: 'points', type: 'INT DEFAULT 0', comment: '积分' },
      { name: 'status', type: 'TINYINT DEFAULT 1', comment: '状态：1-活跃，0-禁用' }
    ];

    for (const column of userColumns) {
      try {
        await query(`ALTER TABLE users ADD COLUMN ${column.name} ${column.type} COMMENT '${column.comment}'`);
        console.log(`✅ 添加用户表字段: ${column.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  用户表字段已存在: ${column.name}`);
        } else {
          throw error;
        }
      }
    }

    // 2. 创建题目分类表
    await query(`
      CREATE TABLE IF NOT EXISTS question_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL COMMENT '分类名称',
        description TEXT COMMENT '分类描述',
        sort_order INT DEFAULT 0 COMMENT '排序',
        status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_sort_order (sort_order),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题目分类表';
    `);
    console.log('✅ 题目分类表创建/更新成功');

    // 3. 扩展题目表结构
    console.log('扩展题目表结构...');
    
    const questionColumns = [
      { name: 'category_id', type: 'INT', comment: '分类ID' },
      { name: 'tags', type: 'JSON', comment: '标签' },
      { name: 'knowledge_points', type: 'JSON', comment: '知识点' },
      { name: 'score', type: 'INT DEFAULT 5', comment: '分值' },
      { name: 'images', type: 'JSON', comment: '图片URLs' },
      { name: 'attachments', type: 'JSON', comment: '附件URLs' },
      { name: 'time_limit', type: 'INT', comment: '答题时间限制（秒）' },
      { name: 'status', type: 'TINYINT DEFAULT 1', comment: '状态：1-启用，0-禁用' },
      { name: 'created_by', type: 'INT', comment: '创建者用户ID' }
    ];

    for (const column of questionColumns) {
      try {
        await query(`ALTER TABLE questions ADD COLUMN ${column.name} ${column.type} COMMENT '${column.comment}'`);
        console.log(`✅ 添加题目表字段: ${column.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  题目表字段已存在: ${column.name}`);
        } else {
          throw error;
        }
      }
    }

    // 添加题目表外键约束
    try {
      await query(`ALTER TABLE questions ADD CONSTRAINT fk_questions_category FOREIGN KEY (category_id) REFERENCES question_categories(id) ON DELETE SET NULL`);
      console.log('✅ 添加题目表分类外键约束');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  题目表分类外键约束已存在');
      } else {
        console.log('⚠️  添加题目表分类外键约束失败:', error.message);
      }
    }

    try {
      await query(`ALTER TABLE questions ADD CONSTRAINT fk_questions_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL`);
      console.log('✅ 添加题目表创建者外键约束');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  题目表创建者外键约束已存在');
      } else {
        console.log('⚠️  添加题目表创建者外键约束失败:', error.message);
      }
    }

    // 4. 创建文章分类表
    await query(`
      CREATE TABLE IF NOT EXISTS article_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL COMMENT '分类名称',
        slug VARCHAR(100) UNIQUE COMMENT '分类标识',
        description TEXT COMMENT '分类描述',
        sort_order INT DEFAULT 0 COMMENT '排序',
        status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_slug (slug),
        INDEX idx_sort_order (sort_order),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章分类表';
    `);
    console.log('✅ 文章分类表创建/更新成功');

    // 5. 扩展文章表结构
    console.log('扩展文章表结构...');
    
    const articleColumns = [
      { name: 'author_id', type: 'INT', comment: '作者用户ID' },
      { name: 'category_id', type: 'INT', comment: '分类ID' },
      { name: 'summary', type: 'TEXT', comment: '文章摘要' },
      { name: 'cover', type: 'VARCHAR(255)', comment: '封面图片URL' },
      { name: 'views', type: 'INT DEFAULT 0', comment: '浏览次数' }
    ];

    for (const column of articleColumns) {
      try {
        await query(`ALTER TABLE articles ADD COLUMN ${column.name} ${column.type} COMMENT '${column.comment}'`);
        console.log(`✅ 添加文章表字段: ${column.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  文章表字段已存在: ${column.name}`);
        } else {
          throw error;
        }
      }
    }

    // 添加文章表外键约束
    try {
      await query(`ALTER TABLE articles ADD CONSTRAINT fk_articles_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL`);
      console.log('✅ 添加文章表作者外键约束');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  文章表作者外键约束已存在');
      } else {
        console.log('⚠️  添加文章表作者外键约束失败:', error.message);
      }
    }

    try {
      await query(`ALTER TABLE articles ADD CONSTRAINT fk_articles_category FOREIGN KEY (category_id) REFERENCES article_categories(id) ON DELETE SET NULL`);
      console.log('✅ 添加文章表分类外键约束');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  文章表分类外键约束已存在');
      } else {
        console.log('⚠️  添加文章表分类外键约束失败:', error.message);
      }
    }

    // 6. 创建用户统计表
    await query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL COMMENT '用户ID',
        correct_rate DECIMAL(5,2) DEFAULT 0.00 COMMENT '正确率',
        continuous_days INT DEFAULT 0 COMMENT '连续学习天数',
        total_questions INT DEFAULT 0 COMMENT '总答题数',
        correct_questions INT DEFAULT 0 COMMENT '正确答题数',
        rank_position INT DEFAULT 0 COMMENT '排名位置',
        last_study_date DATE COMMENT '最后学习日期',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_stats (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_correct_rate (correct_rate),
        INDEX idx_continuous_days (continuous_days),
        INDEX idx_rank_position (rank_position)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户统计表';
    `);
    console.log('✅ 用户统计表创建/更新成功');

    // 7. 创建用户签到表
    await query(`
      CREATE TABLE IF NOT EXISTS user_checkins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL COMMENT '用户ID',
        checkin_date DATE NOT NULL COMMENT '签到日期',
        points_earned INT DEFAULT 5 COMMENT '获得积分',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_checkin (user_id, checkin_date),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_checkin_date (checkin_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户签到表';
    `);
    console.log('✅ 用户签到表创建/更新成功');

    // 8. 创建用户答题记录表
    await query(`
      CREATE TABLE IF NOT EXISTS user_answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL COMMENT '用户ID',
        question_id INT NOT NULL COMMENT '题目ID',
        user_answer TEXT COMMENT '用户答案',
        is_correct BOOLEAN COMMENT '是否正确',
        time_spent INT COMMENT '答题用时（秒）',
        answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_question_id (question_id),
        INDEX idx_is_correct (is_correct),
        INDEX idx_answered_at (answered_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户答题记录表';
    `);
    console.log('✅ 用户答题记录表创建/更新成功');

    // 9. 创建用户学习计划表
    await query(`
      CREATE TABLE IF NOT EXISTS user_study_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL COMMENT '用户ID',
        plan_name VARCHAR(100) NOT NULL COMMENT '计划名称',
        target_questions_per_day INT DEFAULT 10 COMMENT '每日目标题数',
        target_subjects JSON COMMENT '目标科目',
        start_date DATE NOT NULL COMMENT '开始日期',
        end_date DATE COMMENT '结束日期',
        status ENUM('active', 'completed', 'paused') DEFAULT 'active' COMMENT '计划状态',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_start_date (start_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户学习计划表';
    `);
    console.log('✅ 用户学习计划表创建/更新成功');

    // 10. 创建题目评论表
    await query(`
      CREATE TABLE IF NOT EXISTS question_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question_id INT NOT NULL COMMENT '题目ID',
        user_id INT NOT NULL COMMENT '用户ID',
        content TEXT NOT NULL COMMENT '评论内容',
        parent_id INT COMMENT '父评论ID（用于回复）',
        like_count INT DEFAULT 0 COMMENT '点赞数',
        status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-隐藏',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES question_comments(id) ON DELETE CASCADE,
        INDEX idx_question_id (question_id),
        INDEX idx_user_id (user_id),
        INDEX idx_parent_id (parent_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题目评论表';
    `);
    console.log('✅ 题目评论表创建/更新成功');

    // 11. 添加额外的索引优化
    console.log('添加性能优化索引...');
    
    const indexes = [
      { table: 'users', name: 'idx_level_points', columns: '(level, points)' },
      { table: 'questions', name: 'idx_category_difficulty', columns: '(category_id, difficulty)' },
      { table: 'questions', name: 'idx_status_created', columns: '(status, created_at)' },
      { table: 'articles', name: 'idx_category_status', columns: '(category_id, status)' },
      { table: 'user_answers', name: 'idx_user_correct_time', columns: '(user_id, is_correct, answered_at)' }
    ];

    for (const index of indexes) {
      try {
        await query(`ALTER TABLE ${index.table} ADD INDEX ${index.name} ${index.columns}`);
        console.log(`✅ 添加索引: ${index.table}.${index.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`⚠️  索引已存在: ${index.table}.${index.name}`);
        } else {
          console.log(`⚠️  添加索引失败: ${index.table}.${index.name} - ${error.message}`);
        }
      }
    }

    console.log('✅ 增强数据库迁移完成');
    
  } catch (error) {
    console.error('❌ 增强数据库迁移失败:', error.message);
    throw error;
  }
}

// 执行增强迁移
if (require.main === module) {
  migrateEnhanced()
    .then(() => {
      console.log('✅ 数据库结构扩展完成');
      pool.end();
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 迁移过程中发生错误:', error);
      pool.end();
      process.exit(1);
    });
}

module.exports = { migrateEnhanced };