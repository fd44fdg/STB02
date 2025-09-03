/**
 * AI辅助题目生成器
 * 根据技术领域和难度生成题目
 */

const db = require('../config/db');

// 题目生成模板
const questionTemplates = {
  javascript: {
    easy: [
      "JavaScript中{concept1}和{concept2}的区别是什么？",
      "以下哪个方法可以用来{action}？",
      "JavaScript中{feature}的作用是什么？"
    ],
    medium: [
      "请解释JavaScript中{concept}的工作原理。",
      "如何在JavaScript中实现{functionality}？",
      "JavaScript中{feature}有哪些应用场景？"
    ],
    hard: [
      "请设计一个{system}，要求{requirements}。",
      "分析以下JavaScript代码的执行结果并解释原因。",
      "如何优化{scenario}的性能？"
    ]
  },
  css: {
    easy: [
      "CSS中{property}属性的作用是什么？",
      "如何使用CSS实现{effect}？",
      "CSS选择器{selector}的优先级是多少？"
    ],
    medium: [
      "请解释CSS中{concept}的原理。",
      "如何解决CSS中的{problem}问题？",
      "CSS Grid和Flexbox在{scenario}中的应用区别。"
    ]
  },
  react: {
    easy: [
      "React中{hook}的基本用法是什么？",
      "React组件的{lifecycle}生命周期方法有哪些？",
      "如何在React中{action}？"
    ],
    medium: [
      "请解释React中{concept}的工作机制。",
      "如何优化React应用的{aspect}？",
      "React中{pattern}模式的应用场景。"
    ]
  }
};

// 概念词汇库
const concepts = {
  javascript: {
    concept1: ['var', 'let', 'const', 'function', 'arrow function'],
    concept2: ['let', 'const', 'class', 'prototype', 'async/await'],
    concept: ['闭包', '原型链', '事件循环', '异步编程', '模块化'],
    feature: ['解构赋值', '模板字符串', '箭头函数', 'Promise', 'async/await'],
    action: ['遍历数组', '复制对象', '处理异步操作', '创建函数'],
    functionality: ['防抖', '节流', '深拷贝', '发布订阅模式'],
    system: ['缓存系统', '状态管理器', '事件系统', '路由系统'],
    requirements: ['支持过期时间', '支持嵌套状态', '支持事件冒泡', '支持懒加载'],
    scenario: ['大量DOM操作', '频繁API调用', '复杂计算', '内存使用']
  },
  css: {
    property: ['position', 'display', 'flex', 'grid', 'transform'],
    effect: ['居中对齐', '响应式布局', '动画效果', '阴影效果'],
    selector: ['类选择器', 'ID选择器', '属性选择器', '伪类选择器'],
    concept: ['BFC', '层叠上下文', 'CSS优先级', '盒模型'],
    problem: ['浮动清除', '外边距重叠', '兼容性', '性能优化'],
    scenario: ['移动端适配', '复杂布局', '动画性能', '响应式设计']
  },
  react: {
    hook: ['useState', 'useEffect', 'useContext', 'useReducer'],
    lifecycle: ['挂载', '更新', '卸载'],
    action: ['管理状态', '处理事件', '条件渲染', '列表渲染'],
    concept: ['虚拟DOM', 'Diff算法', '组件通信', '状态提升'],
    aspect: ['渲染性能', '包大小', '首屏加载', '用户体验'],
    pattern: ['高阶组件', 'Render Props', '组合模式', '容器组件']
  }
};

// 生成题目内容
function generateQuestionContent(subject, difficulty, template) {
  let content = template;
  const subjectConcepts = concepts[subject] || {};
  
  // 替换模板中的占位符
  Object.keys(subjectConcepts).forEach(key => {
    const placeholder = `{${key}}`;
    if (content.includes(placeholder)) {
      const options = subjectConcepts[key];
      const randomOption = options[Math.floor(Math.random() * options.length)];
      content = content.replace(placeholder, randomOption);
    }
  });
  
  return content;
}

// 生成选项
function generateOptions(subject, questionContent) {
  // 这里可以根据题目内容智能生成选项
  // 简化版本：返回通用选项
  const commonOptions = [
    "选项A", "选项B", "选项C", "选项D"
  ];
  
  return JSON.stringify(commonOptions);
}

async function generateAIQuestions(subject, difficulty, count = 5) {
  try {
    console.log(`🤖 正在生成 ${subject} - ${difficulty} 题目 (${count}道)...`);
    
    const templates = questionTemplates[subject]?.[difficulty] || [];
    if (templates.length === 0) {
      console.log(`⚠️  暂无 ${subject} - ${difficulty} 的题目模板`);
      return 0;
    }
    
    let successCount = 0;
    
    for (let i = 0; i < count; i++) {
      try {
        const template = templates[Math.floor(Math.random() * templates.length)];
        const content = generateQuestionContent(subject, difficulty, template);
        
        const question = {
          title: `${subject.toUpperCase()} ${difficulty} 题目 ${i + 1}`,
          content: content,
          type: Math.random() > 0.7 ? 'essay' : 'single_choice',
          difficulty: difficulty,
          category_id: getSubjectCategoryId(subject),
          view_count: 0,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        // 如果是选择题，生成选项和答案
        if (question.type === 'single_choice') {
          question.options = generateOptions(subject, content);
          question.correct_answer = "选项B"; // 简化版本
          question.explanation = `这是关于${subject}的${difficulty}级别题目的解析。`;
        } else {
          question.options = null;
          question.correct_answer = null;
          question.explanation = `这是一道开放性题目，考查对${subject}的理解和应用能力。`;
        }
        
        await db('questions').insert(question);
        successCount++;
        console.log(`✅ 生成题目: ${question.title}`);
        
      } catch (error) {
        console.error(`❌ 生成第${i + 1}道题目失败:`, error.message);
      }
    }
    
    return successCount;
    
  } catch (error) {
    console.error('❌ AI题目生成失败:', error);
    throw error;
  }
}

function getSubjectCategoryId(subject) {
  const categoryMap = {
    javascript: 1,
    css: 2,
    html: 3,
    vue: 4,
    react: 5,
    algorithm: 6,
    interview: 7
  };
  return categoryMap[subject] || 1;
}

// 批量生成多个领域的题目
async function generateBatchQuestions() {
  const subjects = ['javascript', 'css', 'react'];
  const difficulties = ['easy', 'medium'];
  
  let totalGenerated = 0;
  
  for (const subject of subjects) {
    for (const difficulty of difficulties) {
      const count = await generateAIQuestions(subject, difficulty, 3);
      totalGenerated += count;
    }
  }
  
  console.log(`\n🎉 批量生成完成！总共生成 ${totalGenerated} 道题目`);
  return totalGenerated;
}

// 命令行使用
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🤖 AI题目生成器

使用方法:
  node ai-question-generator.js <subject> <difficulty> [count]
  node ai-question-generator.js --batch

示例:
  node ai-question-generator.js javascript easy 5
  node ai-question-generator.js css medium 3
  node ai-question-generator.js --batch

支持的科目: javascript, css, react, vue, html, algorithm
支持的难度: easy, medium, hard
    `);
    process.exit(0);
  }
  
  if (args[0] === '--batch') {
    generateBatchQuestions()
      .then(count => {
        console.log(`\n🎉 批量生成完成！共生成 ${count} 道题目`);
        process.exit(0);
      })
      .catch(error => {
        console.error('批量生成失败:', error.message);
        process.exit(1);
      });
  } else {
    const [subject, difficulty, count = 5] = args;
    generateAIQuestions(subject, difficulty, parseInt(count))
      .then(generated => {
        console.log(`\n🎉 生成完成！共生成 ${generated} 道题目`);
        process.exit(0);
      })
      .catch(error => {
        console.error('生成失败:', error.message);
        process.exit(1);
      });
  }
}

module.exports = { generateAIQuestions, generateBatchQuestions };
