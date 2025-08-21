import request from '@/utils/request';
import { adaptQuestionData, adaptQuestionList, adaptApiResponse } from '@/utils/dataAdapter';

/**
 * 获取题目列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getQuestions(params) {
  return request.get('/questions', params).then(response => {
    if (response.data) {
      response.data = adaptQuestionList(response.data);
    }
    return response;
  });
}

/**
 * 获取题目详情
 * @param {Number|String} id 题目ID
 * @returns {Promise}
 */
export function getQuestionDetail(id) {
  return request.get(`/questions/${id}`).then(response => {
    if (response.data) {
      response.data = adaptQuestionData(response.data);
    }
    return response;
  });
}

/**
 * 获取题目分类
 * @returns {Promise}
 */
export function getQuestionCategories() {
  return request.get('/questions/categories');
}

/**
 * 提交答案
 * @param {Number|String} id 题目ID
 * @param {*} answer 答案
 * @returns {Promise}
 */
export function submitAnswer(id, answer) {
  return request.post(`/questions/${id}/submit`, { answer });
}

/**
 * 获取练习题目
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getPracticeQuestions(params) {
  return request.get('/questions/practice', params).then(response => {
    if (response.data) {
      response.data = adaptQuestionList(response.data);
    }
    return response;
  });
}

/**
 * 获取模拟考试题目
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getExamQuestions(params) {
  return request.get('/questions/exam', params);
}

/**
 * 提交考试结果
 * @param {Object} data 考试数据
 * @returns {Promise}
 */
export function submitExam(data) {
  return request.post('/questions/exam/submit', data);
}

/**
 * 收藏题目
 * @param {Number|String} id 题目ID
 * @returns {Promise}
 */
export function favoriteQuestion(id) {
  return request.post(`/questions/${id}/favorite`);
}

/**
 * 取消收藏题目
 * @param {Number|String} id 题目ID
 * @returns {Promise}
 */
export function unfavoriteQuestion(id) {
  return request.delete(`/questions/${id}/favorite`);
}

/**
 * 获取收藏的题目列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getFavoriteQuestions(params) {
  return request.get('/questions/favorites', params).then(response => {
    if (response.data) {
      response.data = adaptQuestionList(response.data);
    }
    return response;
  });
}

/**
 * 获取错题列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getWrongQuestions(params) {
  return request.get('/questions/wrong', params).then(response => {
    if (response.data) {
      response.data = adaptQuestionList(response.data);
    }
    return response;
  });
}