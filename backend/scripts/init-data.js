const { pool } = require('../config/database');
const QuestionDataGenerator = require('./question-data-generator');

// 初始化真实题目数据
async function initSampleData() {
  try {
    console.log('🔄 开始初始化真实题目数据...');
    
    // 检查是否已有数据
    const [existingQuestions] = await pool.execute('SELECT COUNT(*) as count FROM questions');
    
    if (existingQuestions[0].count > 0) {
      console.log('📊 数据库中已有题目数据，跳过初始化');
      return;
    }
    
    // 使用真实题目数据生成器
    const generator = new QuestionDataGenerator();
    
    // 生成所有题目数据
    const questions = await generator.generateAllQuestions();
    
    // 验证题目质量
    const isValid = generator.validateQuestions();
    if (!isValid) {
      throw new Error('生成的题目数据质量验证失败');
    }
    
    // 插入题目数据
    let insertedCount = 0;
    for (const question of questions) {
      await pool.execute(
        `INSERT INTO questions (
          title, content, type, difficulty, subject, options, correct_answer, 
          explanation, category_id, tags, knowledge_points, score, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          question.title,
          question.content,
          question.type,
          question.difficulty,
          question.subject,
          question.options,
          question.correct_answer,
          question.explanation,
          question.category_id || 1, // 默认分类ID
          question.tags,
          question.knowledge_points,
          question.score || 5,
          question.status || 1
        ]
      );
      insertedCount++;
    }
    
    console.log(`✅ 成功插入 ${insertedCount} 道真实题目`);
    console.log(`   - JavaScript基础题目: ${questions.filter(q => q.subject === 'JavaScript').length} 道`);
    console.log(`   - 前端开发题目: ${questions.filter(q => ['HTML', 'CSS', 'Vue.js', 'React'].includes(q.subject)).length} 道`);
    console.log(`   - 算法数据结构题目: ${questions.filter(q => ['算法', '数据结构'].includes(q.subject)).length} 道`);
    
  } catch (error) {
    console.error('❌ 初始化真实题目数据失败:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initSampleData()
    .then(() => {
      console.log('🎉 真实题目数据初始化完成');
      pool.end();
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 初始化失败:', error);
      pool.end();
      process.exit(1);
    });
}

module.exports = {
  initSampleData
};