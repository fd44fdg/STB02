const db = require('../config/db');
const ApiError = require('../utils/ApiError');

class SearchService {
  async globalSearch(params) {
    const { keyword, type = 'all', page = 1, limit = 10 } = params;

    if (!keyword || !keyword.trim()) {
      return { items: [], total: 0 };
    }

    const searchTerm = `%${keyword.trim()}%`;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    let queryParts = [];
    let countParts = [];
    const queryParams = [];
    const countParams = [];

    if (type === 'all' || type === 'question') {
      queryParts.push(`(SELECT id, title, 'question' as type, created_at FROM questions WHERE title LIKE ?)`);
      countParts.push(`(SELECT COUNT(*) FROM questions WHERE title LIKE ?)`);
      queryParams.push(searchTerm);
      countParams.push(searchTerm);
    }
    
    if (type === 'all' || type === 'article') {
      queryParts.push(`(SELECT id, title, 'article' as type, created_at FROM articles WHERE title LIKE ? OR content LIKE ?)`);
      countParts.push(`(SELECT COUNT(*) FROM articles WHERE title LIKE ? OR content LIKE ?)`);
      queryParams.push(searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm);
    }
    
    if (type === 'all' || type === 'knowledge') {
      queryParts.push(`(SELECT id, name as title, 'knowledge' as type, created_at FROM knowledge_points WHERE name LIKE ?)`);
      countParts.push(`(SELECT COUNT(*) FROM knowledge_points WHERE name LIKE ?)`);
      queryParams.push(searchTerm);
      countParams.push(searchTerm);
    }

    if (queryParts.length === 0) {
      return { items: [], total: 0 };
    }

    const fullQuery = queryParts.join(' UNION ALL ') + ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const countQuery = `SELECT (${countParts.join(' + ')}) as total`;

    const [results] = await db.query(fullQuery, [...queryParams, limitNum, offset]);
    const [countResult] = await db.query(countQuery, countParams);
    
    const total = countResult[0] && countResult[0][0] ? countResult[0][0].total : 0;

    return { items: results, total };
  }

  getHotKeywords() {
    return ['Vue', 'React', 'JavaScript', 'CSS', 'Node.js', 'TypeScript', 'Webpack', '面试', '算法', '性能优化'];
  }
}

module.exports = new SearchService();