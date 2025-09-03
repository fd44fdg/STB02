const db = require('../config/db');
const ApiError = require('../utils/ApiError');

class ExamService {
  async getExams() {
    const exams = await db('exams')
      .leftJoin('question_categories as qc', 'exams.category_id', 'qc.id')
      .select('exams.*', 'qc.name as category_name')
      .orderBy('exams.created_at', 'desc');
    
    return { items: exams, total: exams.length };
  }

  async getExamById(id) {
    const exam = await db('exams').where({ id }).first();
    if (!exam) {
      throw new ApiError(404, '考试不存在');
    }
    return exam;
  }

  async createExam(examData, userId) {
    const { title, description, duration, question_count, category_id } = examData;
    
    if (!title || !duration || !question_count) {
      throw new ApiError(400, '标题、时长和题目数量为必填项');
    }

    const [id] = await db('exams').insert({
      title,
      description: description || '',
      duration,
      question_count,
      category_id,
      created_by: userId
    });

    return await db('exams').where({ id }).first();
  }

  async updateExam(id, examData) {
    const { title, description, duration, question_count, category_id } = examData;

    if (!title || !duration || !question_count) {
      throw new ApiError(400, 'Title, duration, and question count are required');
    }

    const result = await db('exams')
      .where({ id })
      .update({
        title,
        description,
        duration,
        question_count,
        category_id,
        updated_at: db.fn.now()
      });

    if (!result) {
      throw new ApiError(404, 'Exam not found');
    }

    return await db('exams').where({ id }).first();
  }

  async deleteExam(id) {
    const result = await db('exams').where({ id }).del();
    if (!result) {
      throw new ApiError(404, 'Exam not found');
    }
    return null;
  }

  async startExamAttempt(examId, userId) {
    const trx = await db.transaction();
    
    try {
      const exam = await trx('exams').where({ id: examId }).first();
      if (!exam) {
        throw new ApiError(404, 'Exam not found');
      }

      const [attemptId] = await trx('exam_attempts').insert({
        user_id: userId,
        exam_id: examId,
        start_time: db.fn.now(),
        status: 'in-progress'
      });

      let questionQuery = trx('questions').select('id');
      if (exam.category_id) {
        questionQuery = questionQuery.where('category_id', exam.category_id);
      }
      
      const questions = await questionQuery.orderByRaw('RAND()').limit(exam.question_count);
      
      if (questions.length < exam.question_count) {
        throw new ApiError(400, 'Not enough questions in the category to generate the exam.');
      }

      const attemptQuestionsData = questions.map(q => ({
        attempt_id: attemptId,
        question_id: q.id
      }));
      
      await trx('exam_attempt_questions').insert(attemptQuestionsData);

      const questionIds = questions.map(q => q.id);
      const fullQuestions = await trx('questions as q')
        .join('answers as a', 'q.id', 'a.question_id')
        .select('q.*', 'a.id as answer_id', 'a.text as answer_text')
        .whereIn('q.id', questionIds);

      const hydratedQuestions = questionIds.map(id => {
        const questionData = fullQuestions.find(q => q.id === id);
        return {
          id: questionData.id,
          title: questionData.title,
          content: questionData.content,
          type: questionData.type,
          answers: fullQuestions
            .filter(q => q.id === id)
            .map(a => ({ id: a.answer_id, text: a.answer_text }))
        };
      });

      await trx.commit();

      return {
        attempt_id: attemptId,
        exam_title: exam.title,
        duration: exam.duration,
        questions: hydratedQuestions
      };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async submitExamAttempt(attemptId, userId, answers) {
    const trx = await db.transaction();
    
    try {
      const attempt = await trx('exam_attempts')
        .where({ id: attemptId, user_id: userId, status: 'in-progress' })
        .first();
      
      if (!attempt) {
        throw new ApiError(404, 'Valid exam attempt not found or already completed.');
      }

      const attemptQuestions = await trx('exam_attempt_questions')
        .select('question_id')
        .where('attempt_id', attemptId);
      
      const questionIds = attemptQuestions.map(q => q.question_id);

      const correctAnswers = await trx('answers')
        .select('question_id', 'id')
        .whereIn('question_id', questionIds)
        .where('is_correct', 1);

      const correctAnswersMap = new Map();
      correctAnswers.forEach(row => {
        if (!correctAnswersMap.has(row.question_id)) {
          correctAnswersMap.set(row.question_id, []);
        }
        correctAnswersMap.get(row.question_id).push(String(row.id));
      });

      let correctCount = 0;
      const userAnswersToInsert = [];

      for (const questionId of questionIds) {
        const userAns = answers[questionId] ? answers[questionId].map(String).sort() : [];
        const correctAns = correctAnswersMap.get(parseInt(questionId)) ? 
          correctAnswersMap.get(parseInt(questionId)).sort() : [];
        
        const isCorrect = JSON.stringify(userAns) === JSON.stringify(correctAns);
        
        if (isCorrect) {
          correctCount++;
        }
        
        userAnswersToInsert.push({
          attempt_id: attemptId,
          question_id: questionId,
          selected_answer_ids: JSON.stringify(userAns),
          is_correct: isCorrect
        });
      }

      if (userAnswersToInsert.length > 0) {
        await trx('user_exam_answers').insert(userAnswersToInsert);
      }

      const finalScore = (correctCount / questionIds.length) * 100;
      
      await trx('exam_attempts')
        .where('id', attemptId)
        .update({
          end_time: db.fn.now(),
          status: 'completed',
          score: finalScore
        });

      await trx.commit();

      return {
        attemptId,
        score: finalScore,
        correctCount,
        totalQuestions: questionIds.length
      };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async getExamAttemptResult(attemptId, userId) {
    const attempt = await db('exam_attempts as a')
      .join('exams as e', 'a.exam_id', 'e.id')
      .select('a.*', 'e.title as exam_title')
      .where('a.id', attemptId)
      .where('a.user_id', userId)
      .where('a.status', 'completed')
      .first();

    if (!attempt) {
      throw new ApiError(404, 'Completed exam attempt not found.');
    }

    const results = await db('exam_attempt_questions as eaq')
      .join('questions as q', 'eaq.question_id', 'q.id')
      .leftJoin('user_exam_answers as uea', function() {
        this.on('eaq.attempt_id', 'uea.attempt_id')
            .andOn('eaq.question_id', 'uea.question_id');
      })
      .select(
        'q.id as question_id',
        'q.title',
        'q.explanation',
        'uea.selected_answer_ids',
        'uea.is_correct'
      )
      .where('eaq.attempt_id', attemptId);

    const questionIds = results.map(r => r.question_id);
    const allAnswers = await db('answers')
      .select('id', 'question_id', 'text', 'is_correct')
      .whereIn('question_id', questionIds);

    const hydratedResults = results.map(result => {
      const questionAnswers = allAnswers.filter(a => a.question_id === result.question_id);
      const userSelectedIds = JSON.parse(result.selected_answer_ids || '[]');
      
      return {
        ...result,
        selected_answer_ids: userSelectedIds,
        answers: questionAnswers.map(a => ({ ...a, is_correct: !!a.is_correct }))
      };
    });

    return {
      attempt_details: attempt,
      results: hydratedResults
    };
  }
}

module.exports = new ExamService();