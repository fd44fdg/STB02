/**
 * 初始化知识点分类数据脚本
 */

const { pool, query } = require('../config/database');

async function initKnowledgeCategories() {
  console.log('开始初始化知识点分类数据...');
  
  try {
    // 1. 创建知识点分类表（如果不存在）
    await query(`
      CREATE TABLE IF NOT EXISTS knowledge_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        sort INT DEFAULT 0,
        status TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ knowledge_categories 表创建完成');

    // 2. 创建知识点表（如果不存在）
    await query(`
      CREATE TABLE IF NOT EXISTS knowledge_points (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        category_id INT,
        difficulty TINYINT DEFAULT 1,
        description TEXT,
        content TEXT,
        status TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES knowledge_categories(id)
      )
    `);
    console.log('✅ knowledge_points 表创建完成');

    // 3. 初始化知识点分类数据
    const categories = [
      { name: 'JavaScript基础', description: 'JavaScript语言基础知识，包括语法、数据类型、函数等', sort: 1 },
      { name: 'JavaScript高级', description: 'JavaScript高级特性，包括闭包、原型、异步编程等', sort: 2 },
      { name: 'ES6+新特性', description: 'ECMAScript 6及以上版本的新特性', sort: 3 },
      { name: 'DOM操作', description: '文档对象模型操作相关知识', sort: 4 },
      { name: 'HTML基础', description: 'HTML标记语言基础知识', sort: 5 },
      { name: 'CSS基础', description: 'CSS样式表基础知识', sort: 6 },
      { name: 'CSS高级', description: 'CSS高级特性，包括Flexbox、Grid、动画等', sort: 7 },
      { name: 'Vue.js', description: 'Vue.js框架相关知识', sort: 8 },
      { name: 'React', description: 'React框架相关知识', sort: 9 },
      { name: '前端工程化', description: '前端构建工具、模块化、工程化相关', sort: 10 },
      { name: '算法基础', description: '基础算法和数据结构', sort: 11 },
      { name: '网络协议', description: 'HTTP、TCP/IP等网络协议相关', sort: 12 }
    ];

    for (const category of categories) {
      try {
        await query(`
          INSERT INTO knowledge_categories (name, description, sort) 
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            description = VALUES(description),
            sort = VALUES(sort)
        `, [category.name, category.description, category.sort]);
        console.log(`✅ 知识点分类: ${category.name}`);
      } catch (error) {
        console.log(`⚠️  知识点分类创建失败: ${category.name} - ${error.message}`);
      }
    }

    // 4. 初始化一些示例知识点
    const knowledgePoints = [
      { name: '变量声明与作用域', category_id: 1, difficulty: 1, description: '学习var、let、const的区别和作用域概念' },
      { name: '数据类型与类型转换', category_id: 1, difficulty: 1, description: '掌握JavaScript的基本数据类型' },
      { name: '函数基础', category_id: 1, difficulty: 2, description: '函数声明、表达式和箭头函数' },
      { name: '闭包与作用域链', category_id: 2, difficulty: 3, description: '深入理解闭包的概念和应用' },
      { name: '原型与继承', category_id: 2, difficulty: 3, description: '掌握JavaScript的原型链和继承机制' },
      { name: 'Promise与异步编程', category_id: 2, difficulty: 3, description: '异步编程模式和Promise使用' },
      { name: '解构赋值', category_id: 3, difficulty: 2, description: 'ES6解构赋值语法' },
      { name: '模板字符串', category_id: 3, difficulty: 1, description: 'ES6模板字符串的使用' },
      { name: '箭头函数', category_id: 3, difficulty: 2, description: 'ES6箭头函数语法和特性' }
    ];

    for (const point of knowledgePoints) {
      try {
        await query(`
          INSERT INTO knowledge_points (name, category_id, difficulty, description) 
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            difficulty = VALUES(difficulty),
            description = VALUES(description)
        `, [point.name, point.category_id, point.difficulty, point.description]);
        console.log(`✅ 知识点: ${point.name}`);
      } catch (error) {
        console.log(`⚠️  知识点创建失败: ${point.name} - ${error.message}`);
      }
    }

    console.log('✅ 知识点分类和知识点数据初始化完成');
    
  } catch (error) {
    console.error('❌ 知识点数据初始化失败:', error.message);
    throw error;
  }
}

// 执行初始化
if (require.main === module) {
  initKnowledgeCategories()
    .then(() => {
      console.log('✅ 知识点数据初始化完成');
      pool.end();
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 初始化过程中发生错误:', error);
      pool.end();
      process.exit(1);
    });
}

module.exports = { initKnowledgeCategories };