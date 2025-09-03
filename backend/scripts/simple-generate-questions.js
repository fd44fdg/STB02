/**
 * 简单题目生成脚本 - 匹配现有数据库结构
 */

const db = require('../config/db');

const simpleQuestions = [
  // JavaScript基础题目
  {
    title: "JavaScript变量声明",
    content: "JavaScript中var、let、const的区别是什么？",
    type: "single",
    options: JSON.stringify([
      { key: "A", value: "var有块级作用域，let和const没有" },
      { key: "B", value: "let和const有块级作用域，var没有" },
      { key: "C", value: "三者都有块级作用域" },
      { key: "D", value: "三者都没有块级作用域" }
    ]),
    correct_answer: JSON.stringify("B"),
    explanation: "let和const具有块级作用域，var只有函数作用域。const声明的变量不能重新赋值。",
    difficulty: "easy",
    category_id: 1
  },
  {
    title: "数组遍历方法",
    content: "以下哪些方法可以用来遍历数组？",
    type: "multiple",
    options: JSON.stringify([
      { key: "A", value: "forEach" },
      { key: "B", value: "map" },
      { key: "C", value: "filter" },
      { key: "D", value: "reduce" }
    ]),
    correct_answer: JSON.stringify(["A","B","C","D"]),
    explanation: "forEach、map、filter、reduce都可以用来遍历数组，但用途不同。",
    difficulty: "easy",
    category_id: 1
  },
  {
    title: "JavaScript闭包",
    content: "什么是JavaScript闭包？请举例说明。",
    type: "essay",
    options: null,
    correct_answer: null,
    explanation: "闭包是指函数能够访问其外部作用域中的变量，即使外部函数已经执行完毕。",
    difficulty: "medium",
    category_id: 1
  },
  
  // CSS题目
  {
    title: "CSS定位属性",
    content: "CSS中position属性的值有哪些？",
    type: "multiple",
    options: JSON.stringify([
      { key: "A", value: "static" },
      { key: "B", value: "relative" },
      { key: "C", value: "absolute" },
      { key: "D", value: "fixed" }
    ]),
    correct_answer: JSON.stringify(["A","B","C","D"]),
    explanation: "position属性有static、relative、absolute、fixed、sticky等值。",
    difficulty: "easy",
    category_id: 2
  },
  {
    title: "Flexbox布局",
    content: "Flexbox布局中，justify-content属性用于控制什么？",
    type: "single",
    options: JSON.stringify([
      { key: "A", value: "主轴上的对齐方式" },
      { key: "B", value: "交叉轴上的对齐方式" },
      { key: "C", value: "元素的排列方向" },
      { key: "D", value: "元素的换行方式" }
    ]),
    correct_answer: JSON.stringify("A"),
    explanation: "justify-content控制flex项目在主轴上的对齐方式。",
    difficulty: "medium",
    category_id: 2
  },
  
  // HTML题目
  {
    title: "HTML5语义化标签",
    content: "HTML5新增了哪些语义化标签？",
    type: "multiple",
    options: JSON.stringify([
      { key: "A", value: "header" },
      { key: "B", value: "nav" },
      { key: "C", value: "section" },
      { key: "D", value: "article" }
    ]),
    correct_answer: JSON.stringify(["A","B","C","D"]),
    explanation: "HTML5新增了header、nav、section、article、aside、footer等语义化标签。",
    difficulty: "easy",
    category_id: 3
  },
  
  // Vue题目
  {
    title: "Vue3 Composition API",
    content: "Vue 3中Composition API的核心函数有哪些？",
    type: "multiple",
    options: JSON.stringify([
      { key: "A", value: "ref" },
      { key: "B", value: "reactive" },
      { key: "C", value: "computed" },
      { key: "D", value: "watch" }
    ]),
    correct_answer: JSON.stringify(["A","B","C","D"]),
    explanation: "ref、reactive、computed、watch都是Composition API的核心函数。",
    difficulty: "medium",
    category_id: 4
  },
  
  // React题目
  {
    title: "React Hooks",
    content: "React Hooks中useState的返回值是什么？",
    type: "single",
    options: JSON.stringify([
      { key: "A", value: "一个状态值" },
      { key: "B", value: "一个更新函数" },
      { key: "C", value: "包含状态值和更新函数的数组" },
      { key: "D", value: "包含状态值和更新函数的对象" }
    ]),
    correct_answer: JSON.stringify("C"),
    explanation: "useState返回一个数组，第一个元素是状态值，第二个元素是更新状态的函数。",
    difficulty: "medium",
    category_id: 5
  },
  
  // 算法题目
  {
    title: "时间复杂度",
    content: "时间复杂度O(n²)通常出现在哪种算法中？",
    type: "single",
    options: JSON.stringify([
      { key: "A", value: "二分查找" },
      { key: "B", value: "冒泡排序" },
      { key: "C", value: "哈希查找" },
      { key: "D", value: "线性查找" }
    ]),
    correct_answer: JSON.stringify("B"),
    explanation: "冒泡排序需要两层嵌套循环，时间复杂度为O(n²)。",
    difficulty: "medium",
    category_id: 6
  },
  {
    title: "回文字符串",
    content: "请实现一个函数，判断一个字符串是否为回文。",
    type: "essay",
    options: null,
    correct_answer: null,
    explanation: "可以使用双指针法，从字符串两端向中间比较字符。",
    difficulty: "medium",
    category_id: 6
  },
  
  // 面试题目
  {
    title: "前端性能优化",
    content: "请介绍一下你对前端性能优化的理解和实践。",
    type: "essay",
    options: null,
    correct_answer: null,
    explanation: "可以从代码优化、资源优化、网络优化、渲染优化等方面回答。",
    difficulty: "hard",
    category_id: 7
  },
  {
    title: "防抖函数实现",
    content: "如何实现一个简单的防抖函数？",
    type: "essay",
    options: null,
    correct_answer: null,
    explanation: "防抖函数通过setTimeout延迟执行，在延迟期间如果再次触发则重新计时。",
    difficulty: "medium",
    category_id: 7
  }
];

async function generateSimpleQuestions() {
  try {
    console.log('🚀 开始生成简单题目库...');
    
    let successCount = 0;
    
    for (const question of simpleQuestions) {
      try {
        await db('questions').insert({
          title: question.title,
          content: question.content,
          type: question.type,
          difficulty: question.difficulty,
          options: question.options,
          correct_answer: question.correct_answer,
          explanation: question.explanation,
          category_id: question.category_id,
          status: 'active',
          score: 1,
          view_count: 0,
          tags: JSON.stringify([question.title.split(' ')[0]]), // 简单标签
          created_at: new Date(),
          updated_at: new Date()
        });
        successCount++;
        console.log(`✅ 已生成题目: ${question.title}`);
      } catch (error) {
        console.error(`❌ 生成题目失败 [${question.title}]:`, error.message);
      }
    }
    
    console.log(`\n🎉 题目库生成完成！共生成 ${successCount} 道题目`);
    
    // 显示统计信息
    const stats = await db('questions')
      .select('difficulty')
      .count('* as count')
      .groupBy('difficulty');
      
    console.log('\n📊 题目统计：');
    stats.forEach(stat => {
      console.log(`${stat.difficulty}: ${stat.count} 道`);
    });
    
    return successCount;
    
  } catch (error) {
    console.error('❌ 生成题目库失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  generateSimpleQuestions().then((count) => {
    console.log(`\n🎉 简单题目库初始化完成！共生成 ${count} 道题目`);
    console.log('\n📝 现在你可以：');
    console.log('1. 启动后端服务：node server.js');
    console.log('2. 启动前端应用：cd ../zhangshang-shuati-app && npm run dev:h5');
    console.log('3. 访问应用：http://localhost:8083');
    process.exit(0);
  }).catch(error => {
    console.error('初始化失败:', error);
    process.exit(1);
  });
}

module.exports = { generateSimpleQuestions };
