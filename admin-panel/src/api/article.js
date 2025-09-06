
import * as shared from '../../../shared/api'
const { createResource, createClient } = shared

// 初始化一个基础 client（沿用全局请求工具已设置的 baseURL/token，保持向后兼容）
// 这里保留现状：其它模块继续用 @/utils/request
const client = createClient({ baseURL: process.env.VUE_APP_BASE_API })

const articlesAPI = createResource(client, 'articles')
const categoriesAPI = createResource(client, 'content/articles/categories')

// --- Article Categories ---

export function getArticleCategories() {
  return categoriesAPI.list();
}

export function createArticleCategory(data) {
  return categoriesAPI.create(data);
}

export function updateArticleCategory(id, data) {
  return categoriesAPI.update(id, data);
}

export function deleteArticleCategory(id) {
  return categoriesAPI.delete(id);
}

// --- Articles ---

export function getArticles(params) {
  return articlesAPI.list(params);
}

export function getArticle(id) {
  return articlesAPI.getById(id);
}

export function createArticle(data) {
  return articlesAPI.create(data);
}

export function updateArticle(id, data) {
  return articlesAPI.update(id, data);
}

export function deleteArticle(id) {
  return articlesAPI.delete(id);
}
