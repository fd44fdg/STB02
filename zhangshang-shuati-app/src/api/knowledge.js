import request from '@/utils/request';
import { adaptKnowledgeData, adaptCategoryData, adaptApiResponse } from '@/utils/dataAdapter';

/**
 * 获取知识点分类
 * @returns {Promise}
 */
export function getKnowledgeCategories() {
  return request.get('/knowledge/categories').then(response => {
    // 后端返回的数据结构是 {items: [], total: number}
    if (response.data && response.data.items && Array.isArray(response.data.items)) {
      response.data = response.data.items.map(adaptCategoryData);
    } else if (response.data && Array.isArray(response.data)) {
      response.data = response.data.map(adaptCategoryData);
    }
    return response;
  });
}

/**
 * 获取知识点列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getKnowledgePoints(params = {}) {
  return request.get('/knowledge/points', params).then(response => {
    if (response.data) {
      // 后端返回的数据结构是 {items: [], total: number}
      if (response.data.items && Array.isArray(response.data.items)) {
        response.data = response.data.items.map(adaptKnowledgeData);
      } else if (Array.isArray(response.data)) {
        response.data = response.data.map(adaptKnowledgeData);
      } else if (response.data.list && Array.isArray(response.data.list)) {
        response.data.list = response.data.list.map(adaptKnowledgeData);
      }
    }
    return response;
  });
}

/**
 * 获取知识点详情
 * @param {number} id 知识点ID
 * @returns {Promise}
 */
export function getKnowledgePointDetail(id) {
  return request.get(`/knowledge/${id}`).then(response => {
    if (response.data) {
      response.data = adaptKnowledgeData(response.data);
    }
    return response;
  });
}