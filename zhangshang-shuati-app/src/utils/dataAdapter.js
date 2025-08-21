/**
 * 数据格式适配器
 * 用于处理后端返回的真实数据格式，确保前端组件能正确显示
 */

/**
 * 适配用户信息数据
 * @param {Object} userData 后端返回的用户数据
 * @returns {Object} 适配后的用户数据
 */
export function adaptUserData(userData) {
  if (!userData) return null;
  
  return {
    id: userData.id,
    username: userData.username || userData.name,
    email: userData.email,
    avatar: userData.avatar || '/static/images/default-avatar.png',
    nickname: userData.nickname || userData.username,
    phone: userData.phone,
    gender: userData.gender,
    birthday: userData.birthday,
    createdAt: userData.created_at || userData.createdAt,
    updatedAt: userData.updated_at || userData.updatedAt
  };
}

/**
 * 适配用户统计数据
 * @param {Object} statsData 后端返回的统计数据
 * @returns {Object} 适配后的统计数据
 */
export function adaptUserStats(statsData) {
  if (!statsData) {
    return {
      todayCount: 0,
      totalCount: 0,
      accuracy: 0,
      totalQuestions: 0,
      correctQuestions: 0,
      studyDays: 0,
      continuousStudyDays: 0
    };
  }
  
  return {
    todayCount: statsData.today_count || statsData.todayCount || 0,
    totalCount: statsData.total_count || statsData.totalCount || 0,
    accuracy: statsData.accuracy || statsData.correct_rate || 0,
    totalQuestions: statsData.total_questions || statsData.totalQuestions || 0,
    correctQuestions: statsData.correct_questions || statsData.correctQuestions || 0,
    studyDays: statsData.study_days || statsData.studyDays || 0,
    continuousStudyDays: statsData.continuous_study_days || statsData.continuousStudyDays || 0,
    dailyTarget: statsData.daily_target || statsData.dailyTarget || 20
  };
}

/**
 * 适配题目数据
 * @param {Object} questionData 后端返回的题目数据
 * @returns {Object} 适配后的题目数据
 */
export function adaptQuestionData(questionData) {
  if (!questionData) return null;
  
  return {
    id: questionData.id,
    title: questionData.title || questionData.question,
    content: questionData.content || questionData.description,
    type: questionData.type || 'single', // single, multiple, judge, fill
    options: questionData.options || [],
    answer: questionData.answer || questionData.correct_answer,
    explanation: questionData.explanation || questionData.analysis,
    difficulty: questionData.difficulty || 1, // 1-简单, 2-中等, 3-困难
    categoryId: questionData.category_id || questionData.categoryId,
    categoryName: questionData.category_name || questionData.categoryName,
    tags: questionData.tags || [],
    createdAt: questionData.created_at || questionData.createdAt,
    updatedAt: questionData.updated_at || questionData.updatedAt
  };
}

/**
 * 适配题目列表数据
 * @param {Object} listData 后端返回的列表数据
 * @returns {Object} 适配后的列表数据
 */
export function adaptQuestionList(listData) {
  if (!listData) {
    return {
      list: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    };
  }
  
  const questions = (listData.data || listData.list || listData.questions || []).map(adaptQuestionData);
  
  return {
    list: questions,
    total: listData.total || listData.count || questions.length,
    page: listData.page || listData.current_page || 1,
    limit: listData.limit || listData.per_page || 10,
    totalPages: listData.total_pages || listData.totalPages || Math.ceil((listData.total || questions.length) / (listData.limit || 10))
  };
}

/**
 * 适配知识点数据
 * @param {Object} knowledgeData 后端返回的知识点数据
 * @returns {Object} 适配后的知识点数据
 */
export function adaptKnowledgeData(knowledgeData) {
  if (!knowledgeData) return null;
  
  return {
    id: knowledgeData.id,
    title: knowledgeData.title || knowledgeData.name,
    description: knowledgeData.description || knowledgeData.content,
    category: knowledgeData.category || knowledgeData.category_name,
    categoryId: knowledgeData.category_id || knowledgeData.categoryId,
    difficulty: knowledgeData.difficulty || 1,
    questionCount: knowledgeData.question_count || knowledgeData.questionCount || 0,
    studyCount: knowledgeData.study_count || knowledgeData.studyCount || 0,
    tags: knowledgeData.tags || [],
    createdAt: knowledgeData.created_at || knowledgeData.createdAt,
    updatedAt: knowledgeData.updated_at || knowledgeData.updatedAt
  };
}

/**
 * 适配分类数据
 * @param {Object} categoryData 后端返回的分类数据
 * @returns {Object} 适配后的分类数据
 */
export function adaptCategoryData(categoryData) {
  if (!categoryData) return null;
  
  return {
    id: categoryData.id,
    name: categoryData.name || categoryData.title,
    description: categoryData.description,
    count: categoryData.count || categoryData.pointCount || categoryData.question_count || 0,
    icon: categoryData.icon,
    color: categoryData.color,
    parentId: categoryData.parent_id || categoryData.parentId,
    sort: categoryData.sort || categoryData.order || 0,
    createdAt: categoryData.created_at || categoryData.createdAt,
    updatedAt: categoryData.updated_at || categoryData.updatedAt
  };
}

/**
 * 适配签到数据
 * @param {Object} checkInData 后端返回的签到数据
 * @returns {Object} 适配后的签到数据
 */
export function adaptCheckInData(checkInData) {
  if (!checkInData) {
    return {
      isCheckedIn: false,
      checkInDays: 0,
      continuousCheckInDays: 0,
      pointsEarned: 0
    };
  }
  
  return {
    isCheckedIn: checkInData.is_checked_in || checkInData.isCheckedIn || false,
    checkInDays: checkInData.check_in_days || checkInData.checkInDays || 0,
    continuousCheckInDays: checkInData.continuous_check_in_days || checkInData.continuousCheckInDays || 0,
    pointsEarned: checkInData.points_earned || checkInData.pointsEarned || 0,
    lastCheckInDate: checkInData.last_check_in_date || checkInData.lastCheckInDate
  };
}

/**
 * 适配学习记录数据
 * @param {Object} recordData 后端返回的学习记录数据
 * @returns {Object} 适配后的学习记录数据
 */
export function adaptStudyRecordData(recordData) {
  if (!recordData) return null;
  
  return {
    id: recordData.id,
    questionId: recordData.question_id || recordData.questionId,
    questionTitle: recordData.question_title || recordData.questionTitle,
    userAnswer: recordData.user_answer || recordData.userAnswer,
    correctAnswer: recordData.correct_answer || recordData.correctAnswer,
    isCorrect: recordData.is_correct || recordData.isCorrect || false,
    timeSpent: recordData.time_spent || recordData.timeSpent || 0,
    studyDate: recordData.study_date || recordData.studyDate || recordData.created_at,
    createdAt: recordData.created_at || recordData.createdAt,
    updatedAt: recordData.updated_at || recordData.updatedAt
  };
}

/**
 * 通用的API响应数据适配器
 * @param {Object} response API响应数据
 * @param {Function} dataAdapter 具体的数据适配函数
 * @returns {Object} 适配后的响应数据
 */
export function adaptApiResponse(response, dataAdapter) {
  if (!response) return null;
  
  // 标准化响应格式
  const standardResponse = {
    code: response.code || response.status || 200,
    message: response.message || response.msg || 'success',
    data: response.data || response.result || response
  };
  
  // 如果提供了数据适配器，则适配数据
  if (dataAdapter && typeof dataAdapter === 'function') {
    standardResponse.data = dataAdapter(standardResponse.data);
  }
  
  return standardResponse;
}