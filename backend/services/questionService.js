const db = require('../config/db');
const ApiError = require('../utils/ApiError');

class QuestionService {
  // --- 分类管理 ---
  async getCategories() {
    const categories = await db('question_categories')
      .leftJoin('questions', 'question_categories.id', 'questions.category_id')
      .select('question_categories.*', db.raw('COUNT(questions.id) as questionCount'))
      .groupBy('question_categories.id');
    
    return { items: categories, total: categories.length };
  }

  async createCategory(categoryData, userId) {
    const { name, description } = categoryData;
    if (!name) throw new ApiError(400, '分类名称不能为空');

    const [id] = await db('question_categories').insert({
      name,
      description: description || '',
      created_by: userId
    });

    return await db('question_categories').where({ id }).first();
  }

  async updateCategory(id, categoryData) {
    const { name, description } = categoryData;
    if (!name && !description) throw new ApiError(400, '没有提供要更新的字段');

    const result = await db('question_categories')
      .where({ id })
      .update({ name, description });

    if (!result) throw new ApiError(404, '分类不存在');
    return await db('question_categories').where({ id }).first();
  }

  async deleteCategory(id) {
    const countResult = await db('questions')
      .where({ category_id: id })
      .count('* as count');
    
    if (countResult[0].count > 0) throw new ApiError(400, '该分类下仍有题目，无法删除');

    const result = await db('question_categories').where({ id }).del();
    if (!result) throw new ApiError(404, '分类不存在');
    return null;
  }

  // --- 题目管理 ---
  async getQuestions(filters = {}) {
    const { page = 1, limit = 10, category_id } = filters;
    
    let query = db('questions');
    
    if (category_id) {
      query = query.where({ category_id });
    }

    const questions = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    const totalResult = await query.clone().count('* as total');
    const total = parseInt(totalResult[0].total);

    // 解析JSON字段
    questions.forEach(q => {
      q.options = JSON.parse(q.options || '[]');
      q.correct_answer = JSON.parse(q.correct_answer || '[]');
    });

    return { items: questions, total };
  }

  async getQuestionById(id) {
    const question = await db('questions').where({ id }).first();
    if (!question) throw new ApiError(404, '题目不存在');

    question.options = JSON.parse(question.options || '[]');
    question.correct_answer = JSON.parse(question.correct_answer || '[]');
    
    return question;
  }

  async createQuestion(questionData, userId) {
    const { 
      title, content, category_id, type, options, correct_answer, 
      difficulty, explanation, tags, knowledge_points, score, 
      images, attachments, time_limit, status 
    } = questionData;

    if (!title || !category_id || !type) {
      throw new ApiError(400, '缺少必要的题目参数');
    }

    if (['single', 'multiple', 'boolean'].includes(type) && (!options || options.length < 2)) {
      throw new ApiError(400, '选择题至少需要2个选项');
    }

    if (!correct_answer) {
      throw new ApiError(400, '请设置正确答案');
    }

    const [id] = await db('questions').insert({
      title,
      content: content || '',
      category_id,
      type,
      options: JSON.stringify(options || []),
      correct_answer: JSON.stringify(correct_answer),
      difficulty: difficulty || 'medium',
      explanation: explanation || '',
      tags: JSON.stringify(tags || []),
      knowledge_points: JSON.stringify(knowledge_points || []),
      score: score || 5,
      images: JSON.stringify(images || []),
      attachments: JSON.stringify(attachments || []),
      time_limit: time_limit || null,
      status: status !== undefined ? status : 1,
      created_by: userId
    });

    return await db('questions').where({ id }).first();
  }

  async updateQuestion(id, questionData) {
    const { 
      title, content, category_id, type, options, correct_answer, 
      difficulty, explanation, tags, knowledge_points, score, 
      images, attachments, time_limit, status 
    } = questionData;

    const result = await db('questions')
      .where({ id })
      .update({
        title,
        content: content || '',
        category_id,
        type,
        options: JSON.stringify(options || []),
        correct_answer: JSON.stringify(correct_answer),
        difficulty: difficulty || 'medium',
        explanation: explanation || '',
        tags: JSON.stringify(tags || []),
        knowledge_points: JSON.stringify(knowledge_points || []),
        score: score || 5,
        images: JSON.stringify(images || []),
        attachments: JSON.stringify(attachments || []),
        time_limit: time_limit || null,
        status: status !== undefined ? status : 1,
        updated_at: db.fn.now()
      });

    if (!result) throw new ApiError(404, '题目不存在');
    return await db('questions').where({ id }).first();
  }

  async deleteQuestion(id) {
    const result = await db('questions').where({ id }).del();
    if (!result) throw new ApiError(404, '题目不存在');
    return null;
  }

  // --- 批量操作 ---
  async batchCreateQuestions(questions, userId) {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new ApiError(400, '请提供有效的题目数组');
    }

    if (questions.length > 100) {
      throw new ApiError(400, '单次最多创建100道题目');
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < questions.length; i++) {
      try {
        const question = questions[i];
        const { 
          title, content, category_id, type, options, correct_answer, 
          difficulty, explanation, tags, knowledge_points, score, 
          images, attachments, time_limit, status 
        } = question;

        if (!title || !category_id || !type) {
          errors.push({ index: i + 1, error: '缺少必要的题目参数' });
          continue;
        }

        const [id] = await db('questions').insert({
          title,
          content: content || '',
          category_id,
          type,
          options: JSON.stringify(options || []),
          correct_answer: JSON.stringify(correct_answer),
          difficulty: difficulty || 'medium',
          explanation: explanation || '',
          tags: JSON.stringify(tags || []),
          knowledge_points: JSON.stringify(knowledge_points || []),
          score: score || 5,
          images: JSON.stringify(images || []),
          attachments: JSON.stringify(attachments || []),
          time_limit: time_limit || null,
          status: status !== undefined ? status : 1,
          created_by: userId
        });

        results.push({ index: i + 1, id, success: true });
      } catch (error) {
        errors.push({ index: i + 1, error: error.message });
      }
    }

    return {
      total: questions.length,
      success: results.length,
      failed: errors.length,
      results,
      errors
    };
  }

  // --- 统计分析 ---
  async getAnalytics() {
    const [categoryStats] = await db('question_categories')
      .leftJoin('questions', 'question_categories.id', 'questions.category_id')
      .select(
        'question_categories.name as category_name',
        db.raw('COUNT(questions.id) as question_count'),
        db.raw('AVG(questions.score) as avg_score')
      )
      .groupBy('question_categories.id', 'question_categories.name');

    const [difficultyStats] = await db('questions')
      .select('difficulty', db.raw('COUNT(*) as count'))
      .groupBy('difficulty');

    const [typeStats] = await db('questions')
      .select('type', db.raw('COUNT(*) as count'))
      .groupBy('type');

    const [totalStats] = await db('questions')
      .select(
        db.raw('COUNT(*) as total_questions'),
        db.raw('AVG(score) as avg_score'),
        db.raw('MAX(created_at) as latest_created')
      );

    return {
      total: totalStats[0],
      by_category: categoryStats,
      by_difficulty: difficultyStats,
      by_type: typeStats
    };
  }
}

module.exports = new QuestionService();