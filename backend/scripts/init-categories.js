/**
 * 初始化分类数据脚本
 * 为题目和文章创建基础分类数据
 */

const { pool, query } = require('../config/database');

async function initCategories() {
  console.log('开始初始化分类数据...');
  
  try {
    // 1. 初始化题目分类
    console.log('初始化题目分类...');
    
    const questionCategories = [
      { name: 'JavaScript基础', description: 'JavaScript语言基础知识，包括语法、数据类型、函数等', sort_order: 1 },
      { name: 'JavaScript高级', description: 'JavaScript高级特性，包括闭包、原型、异步编程等', sort_order: 2 },
      { name: 'ES6+新特性', description: 'ECMAScript 6及以上版本的新特性', sort_order: 3 },
      { name: 'DOM操作', description: '文档对象模型操作相关题目', sort_order: 4 },
      { name: 'HTML基础', description: 'HTML标记语言基础知识', sort_order: 5 },
      { name: 'CSS基础', description: 'CSS样式表基础知识', sort_order: 6 },
      { name: 'CSS高级', description: 'CSS高级特性，包括Flexbox、Grid、动画等', sort_order: 7 },
      { name: 'Vue.js', description: 'Vue.js框架相关知识', sort_order: 8 },
      { name: 'React', description: 'React框架相关知识', sort_order: 9 },
      { name: '前端工程化', description: '前端构建工具、模块化、工程化相关', sort_order: 10 },
      { name: '算法基础', description: '基础算法和数据结构', sort_order: 11 },
      { name: '算法进阶', description: '高级算法和复杂数据结构', sort_order: 12 },
      { name: '网络协议', description: 'HTTP、TCP/IP等网络协议相关', sort_order: 13 },
      { name: '浏览器原理', description: '浏览器工作原理、性能优化等', sort_order: 14 },
      { name: '前端安全', description: '前端安全相关知识', sort_order: 15 }
    ];

    for (const category of questionCategories) {
      try {
        await query(`
          INSERT INTO question_categories (name, description, sort_order) 
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            description = VALUES(description),
            sort_order = VALUES(sort_order)
        `, [category.name, category.description, category.sort_order]);
        console.log(`✅ 题目分类: ${category.name}`);
      } catch (error) {
        console.log(`⚠️  题目分类创建失败: ${category.name} - ${error.message}`);
      }
    }

    // 2. 初始化文章分类
    console.log('初始化文章分类...');
    
    const articleCategories = [
      { name: '技术教程', slug: 'tutorial', description: '技术学习教程和指南', sort_order: 1 },
      { name: '前端开发', slug: 'frontend', description: '前端开发相关技术文章', sort_order: 2 },
      { name: '后端开发', slug: 'backend', description: '后端开发相关技术文章', sort_order: 3 },
      { name: '全栈开发', slug: 'fullstack', description: '全栈开发相关内容', sort_order: 4 },
      { name: '算法解析', slug: 'algorithm', description: '算法题目解析和思路分享', sort_order: 5 },
      { name: '面试经验', slug: 'interview', description: '面试经验分享和技巧', sort_order: 6 },
      { name: '项目实战', slug: 'project', description: '实际项目开发经验分享', sort_order: 7 },
      { name: '工具推荐', slug: 'tools', description: '开发工具和资源推荐', sort_order: 8 },
      { name: '行业动态', slug: 'industry', description: '技术行业动态和趋势', sort_order: 9 },
      { name: '学习心得', slug: 'learning', description: '学习方法和心得体会', sort_order: 10 }
    ];

    for (const category of articleCategories) {
      try {
        await query(`
          INSERT INTO article_categories (name, slug, description, sort_order) 
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            description = VALUES(description),
            sort_order = VALUES(sort_order)
        `, [category.name, category.slug, category.description, category.sort_order]);
        console.log(`✅ 文章分类: ${category.name}`);
      } catch (error) {
        console.log(`⚠️  文章分类创建失败: ${category.name} - ${error.message}`);
      }
    }

    console.log('✅ 分类数据初始化完成');
    
  } catch (error) {
    console.error('❌ 分类数据初始化失败:', error.message);
    throw error;
  }
}

// 执行初始化
if (require.main === module) {
  initCategories()
    .then(() => {
      console.log('✅ 分类数据初始化完成');
      pool.end();
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 初始化过程中发生错误:', error);
      pool.end();
      process.exit(1);
    });
}

module.exports = { initCategories };