/**
 * 初始种子数据
 * 包含基础的分类、管理员用户和示例题目
 */

const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // 清空现有数据（按依赖关系倒序删除）
  await knex('user_study_records').del();
  await knex('user_wrong_questions').del();
  await knex('user_favorites').del();
  await knex('user_answers').del();
  await knex('questions').del();
  await knex('question_categories').del();
  await knex('users').del();
  await knex('system_settings').del();

  // 1. 插入题目分类
  const categories = await knex('question_categories').insert([
    {
      id: 1,
      name: 'JavaScript基础',
      description: 'JavaScript语言基础知识，包括语法、数据类型、函数等',
      sort_order: 1,
      status: 'active'
    },
    {
      id: 2,
      name: 'JavaScript高级',
      description: 'JavaScript高级特性，包括闭包、原型、异步编程等',
      sort_order: 2,
      status: 'active'
    },
    {
      id: 3,
      name: 'ES6+新特性',
      description: 'ECMAScript 6及以上版本的新特性',
      sort_order: 3,
      status: 'active'
    },
    {
      id: 4,
      name: 'Vue.js',
      description: 'Vue.js框架相关知识',
      sort_order: 4,
      status: 'active'
    },
    {
      id: 5,
      name: 'Node.js',
      description: 'Node.js后端开发相关知识',
      sort_order: 5,
      status: 'active'
    }
  ]);

  // 2. 插入管理员用户
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const users = await knex('users').insert([
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      password_hash: adminPasswordHash,
      nickname: '系统管理员',
      role: 'admin',
      status: 'active',
      total_score: 0,
      study_days: 0
    },
    {
      id: 2,
      username: 'testuser',
      email: 'test@example.com',
      password_hash: await bcrypt.hash('test123', 10),
      nickname: '测试用户',
      role: 'user',
      status: 'active',
      total_score: 0,
      study_days: 0
    }
  ]);

  // 3. 插入示例题目
  await knex('questions').insert([
    {
      title: 'JavaScript中的闭包是什么？',
      content: '请解释JavaScript中闭包的概念，并给出一个实际应用的例子。',
      type: 'essay',
      difficulty: 'medium',
      subject: 'JavaScript',
      options: null,
      correct_answer: JSON.stringify('闭包是指有权访问另一个函数作用域中的变量的函数。'),
      explanation: '闭包是JavaScript中的核心概念，它使得函数能够"记住"其词法作用域。',
      category_id: 2,
      tags: JSON.stringify(['闭包', '作用域', '函数']),
      knowledge_points: JSON.stringify(['词法作用域', '函数嵌套', '变量访问']),
      score: 10,
      status: 'active'
    },
    {
      title: '以下哪个方法可以用来遍历数组？',
      content: '选择所有可以用来遍历JavaScript数组的方法：',
      type: 'multiple',
      difficulty: 'easy',
      subject: 'JavaScript',
      options: JSON.stringify(['for循环', 'forEach方法', 'map方法', 'while循环', 'if语句']),
      correct_answer: JSON.stringify(['for循环', 'forEach方法', 'map方法', 'while循环']),
      explanation: 'for循环、forEach方法、map方法和while循环都可以用来遍历数组。if语句是条件判断语句，不能用于遍历数组。',
      category_id: 1,
      tags: JSON.stringify(['数组', '遍历', '循环']),
      knowledge_points: JSON.stringify(['数组方法', '循环结构']),
      score: 5,
      status: 'active'
    },
    {
      title: 'var、let、const的区别是什么？',
      content: '请详细说明JavaScript中var、let、const三种变量声明方式的区别。',
      type: 'essay',
      difficulty: 'medium',
      subject: 'JavaScript',
      options: null,
      correct_answer: JSON.stringify('主要区别在于作用域、变量提升和重复声明等方面'),
      explanation: 'var是函数作用域，let/const是块级作用域；var存在变量提升，let/const不存在；const声明的变量不能重新赋值。',
      category_id: 3,
      tags: JSON.stringify(['变量声明', 'ES6', '作用域']),
      knowledge_points: JSON.stringify(['变量提升', '块级作用域', '常量']),
      score: 8,
      status: 'active'
    }
  ]);

  // 4. 插入系统设置
  await knex('system_settings').insert([
    {
      key: 'site_name',
      value: '掌上刷题宝',
      description: '网站名称',
      type: 'string'
    },
    {
      key: 'site_description',
      value: '随时随地，轻松刷题',
      description: '网站描述',
      type: 'string'
    },
    {
      key: 'daily_question_limit',
      value: '100',
      description: '每日答题限制',
      type: 'number'
    },
    {
      key: 'enable_registration',
      value: 'true',
      description: '是否允许用户注册',
      type: 'boolean'
    },
    {
      key: 'wechat_config',
      value: JSON.stringify({
        appId: '',
        secret: '',
        enabled: false
      }),
      description: '微信小程序配置',
      type: 'json'
    }
  ]);

  console.log('✅ 种子数据插入完成');
};
