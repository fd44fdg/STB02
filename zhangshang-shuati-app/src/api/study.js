import request from '@/utils/request';
import { adaptQuestionList, adaptStudyRecordData, adaptApiResponse } from '@/utils/dataAdapter';

// 收藏夹相关API

/**
 * 获取收藏列表
 * @param {Object} params - 查询参数
 * @param {Number} params.page - 页码
 * @param {Number} params.limit - 每页数量
 * @param {String} params.category - 分类筛选
 * @param {String} params.difficulty - 难度筛选
 * @returns {Promise}
 */
export function getFavorites(params) {
  return request.get('/study/favorites', params).then(response => {
    if (response.data) {
      response.data = adaptQuestionList(response.data);
    }
    return response;
  });
}

/**
 * 添加收藏
 * @param {Number} questionId - 题目ID
 * @returns {Promise}
 */
export function addFavorite(questionId) {
  return request.post(`/study/favorites/${questionId}`);
}

/**
 * 取消收藏
 * @param {Number} questionId - 题目ID
 * @returns {Promise}
 */
export function removeFavorite(questionId) {
  return request.delete(`/study/favorites/${questionId}`);
}

/**
 * 检查题目是否已收藏
 * @param {Number} questionId - 题目ID
 * @returns {Promise}
 */
export function checkFavorite(questionId) {
  return request.get(`/study/favorites/check/${questionId}`);
}

// 错题本相关API

/**
 * 获取错题列表
 * @param {Object} params - 查询参数
 * @param {Number} params.page - 页码
 * @param {Number} params.limit - 每页数量
 * @param {String} params.category - 分类筛选
 * @param {String} params.difficulty - 难度筛选
 * @param {Boolean} params.mastered - 是否已掌握
 * @returns {Promise}
 */
export function getWrongQuestions(params) {
  return request.get('/study/wrong-questions', params).then(response => {
    if (response.data) {
      response.data = adaptQuestionList(response.data);
    }
    return response;
  });
}

/**
 * 标记错题为已掌握
 * @param {Number} questionId - 题目ID
 * @returns {Promise}
 */
export function markWrongQuestionAsMastered(questionId) {
  return request.put(`/study/wrong-questions/${questionId}/mastered`);
}

/**
 * 标记错题为未掌握
 * @param {Number} questionId - 题目ID
 * @returns {Promise}
 */
export function markWrongQuestionAsUnmastered(questionId) {
  return request.put(`/study/wrong-questions/${questionId}/unmastered`);
}

// 学习记录相关API

/**
 * 获取学习记录
 * @param {Object} params - 查询参数
 * @param {String} params.startDate - 开始日期
 * @param {String} params.endDate - 结束日期
 * @param {Number} params.limit - 记录数量限制
 * @returns {Promise}
 */
export function getStudyRecords(params) {
  return request.get('/study/records', params).then(response => {
    if (response.data) {
      if (Array.isArray(response.data)) {
        response.data = response.data.map(adaptStudyRecordData);
      } else if (response.data.list && Array.isArray(response.data.list)) {
        response.data.list = response.data.list.map(adaptStudyRecordData);
      }
    }
    return response;
  });
}

/**
 * 记录学习数据
 * @param {Object} data - 学习数据
 * @param {String} data.study_date - 学习日期
 * @param {Number} data.questions_count - 答题数量
 * @param {Number} data.correct_count - 正确数量
 * @param {Number} data.study_time - 学习时长（秒）
 * @param {Array} data.categories - 学习的分类
 * @returns {Promise}
 */
export function addStudyRecord(data) {
  return request.post('/study/records', data);
}

/**
 * 记录学习数据（别名函数）
 * @param {Object} data - 学习数据
 * @returns {Promise}
 */
export function recordStudyData(data) {
  return addStudyRecord(data);
}
