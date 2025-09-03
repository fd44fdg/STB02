/**
 * 题目库生成脚本
 * 快速生成各类编程题目，用于初始化题库
 */

const db = require('../config/db');

// 编程基础题目模板
const questionTemplates = {
  javascript: [
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
      content: "以下哪个方法可以用来遍历数组？",
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
      title: "JavaScript闭包概念",
      content: "什么是JavaScript闭包？请举例说明。",
      type: "essay",
      options: null,
      correct_answer: null,
      explanation: "闭包是指函数能够访问其外部作用域中的变量，即使外部函数已经执行完毕。",
      difficulty: "medium",
      category_id: 1
    }
  ],
  
  css: [
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
    }
  ],
  
  html: [
    {
      content: "HTML5新增了哪些语义化标签？",
      type: "multiple_choice",
      options: JSON.stringify([
        { key: "A", value: "header" },
        { key: "B", value: "nav" },
        { key: "C", value: "section" },
        { key: "D", value: "article" }
      ]),
      correct_answer: "A,B,C,D",
      explanation: "HTML5新增了header、nav、section、article、aside、footer等语义化标签。",
      difficulty: "easy",
      category_id: 3
    }
  ],
  
  vue: [
    {
      content: "Vue 3中Composition API的核心函数有哪些？",
      type: "multiple_choice",
      options: JSON.stringify([
        { key: "A", value: "ref" },
        { key: "B", value: "reactive" },
        { key: "C", value: "computed" },
        { key: "D", value: "watch" }
      ]),
      correct_answer: "A,B,C,D",
      explanation: "ref、reactive、computed、watch都是Composition API的核心函数。",
      difficulty: "medium",
      category_id: 4
    }
  ],
  
  react: [
    {
      content: "React Hooks中useState的返回值是什么？",
      type: "single_choice",
      options: JSON.stringify([
        { key: "A", value: "一个状态值" },
        { key: "B", value: "一个更新函数" },
        { key: "C", value: "包含状态值和更新函数的数组" },
        { key: "D", value: "包含状态值和更新函数的对象" }
      ]),
      correct_answer: "C",
      explanation: "useState返回一个数组，第一个元素是状态值，第二个元素是更新状态的函数。",
      difficulty: "medium",
      category_id: 5
    }
  ],
  
  algorithm: [
    {
      content: "时间复杂度O(n²)通常出现在哪种算法中？",
      type: "single_choice",
      options: JSON.stringify([
        { key: "A", value: "二分查找" },
        { key: "B", value: "冒泡排序" },
        { key: "C", value: "哈希查找" },
        { key: "D", value: "线性查找" }
      ]),
      correct_answer: "B",
      explanation: "冒泡排序需要两层嵌套循环，时间复杂度为O(n²)。",
      difficulty: "medium",
      category_id: 6
    },
    {
      content: "请实现一个函数，判断一个字符串是否为回文。",
      type: "essay",
      options: null,
      correct_answer: null,
      explanation: "可以使用双指针法，从字符串两端向中间比较字符。",
      difficulty: "medium",
      category_id: 6
    }
  ]
};

// 面试题目模板
const interviewQuestions = [
  {
    content: "请介绍一下你对前端性能优化的理解和实践。",
    type: "essay",
    options: null,
    correct_answer: null,
    explanation: "可以从代码优化、资源优化、网络优化、渲染优化等方面回答。",
    difficulty: "hard",
    category_id: 7
  },
  {
    content: "如何实现一个简单的防抖函数？",
    type: "essay", 
    options: null,
    correct_answer: null,
    explanation: "防抖函数通过setTimeout延迟执行，在延迟期间如果再次触发则重新计时。",
    difficulty: "medium",
    category_id: 7
  }
];

async function generateQuestionBank() {
  try {
    console.log('🚀 开始生成题目库...');
    
    let totalQuestions = 0;
    
    // 插入各类编程题目
    for (const [subject, questions] of Object.entries(questionTemplates)) {
      console.log(`📝 正在生成 ${subject} 题目...`);
      
      for (const question of questions) {
        await db('questions').insert({
          ...question,
          subject: subject,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        });
        totalQuestions++;
      }
    }
    
    // 插入面试题目
    console.log('📝 正在生成面试题目...');
    for (const question of interviewQuestions) {
      await db('questions').insert({
        ...question,
        subject: 'interview',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });
      totalQuestions++;
    }
    
    console.log(`✅ 题目库生成完成！共生成 ${totalQuestions} 道题目`);
    
    // 显示统计信息
    const stats = await db('questions')
      .select('subject', 'difficulty')
      .count('* as count')
      .groupBy('subject', 'difficulty');
      
    console.log('\n📊 题目统计：');
    stats.forEach(stat => {
      console.log(`${stat.subject} - ${stat.difficulty}: ${stat.count} 道`);
    });
    
  } catch (error) {
    console.error('❌ 生成题目库失败:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  generateQuestionBank().then(() => {
    console.log('\n🎉 题目库初始化完成！');
    process.exit(0);
  }).catch(error => {
    console.error('初始化失败:', error);
    process.exit(1);
  });
}

module.exports = { generateQuestionBank, questionTemplates };
