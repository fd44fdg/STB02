const db = require('../config/db');
const ApiError = require('../utils/ApiError');

class ContentService {
  // ===================================
  // Article Category Management
  // ===================================

  async getCategories() {
    const categories = await db.query(`
      SELECT c.*, COUNT(a.id) as articleCount 
      FROM article_categories c 
      LEFT JOIN articles a ON c.id = a.category_id 
      GROUP BY c.id
    `);
    return { items: categories[0], total: categories[0].length };
  }

  async createCategory(data) {
    const { name, description, slug } = data;
    if (!name || !slug) {
      throw new ApiError(400, '分类名称和slug不能为空');
    }

    const [result] = await db.query(
      'INSERT INTO article_categories (name, description, slug) VALUES (?, ?, ?)', 
      [name, description || '', slug]
    );
    const [newCategory] = await db.query(
      'SELECT * FROM article_categories WHERE id = ?', 
      [result.insertId || result.id]
    );
    return newCategory[0];
  }

  async updateCategory(id, data) {
    const { name, description, slug } = data;
    if (!name && !description && !slug) {
      throw new ApiError(400, '没有要更新的字段');
    }

    await db.query(
      'UPDATE article_categories SET name = ?, description = ?, slug = ? WHERE id = ?', 
      [name, description, slug, id]
    );
    const [updatedCategory] = await db.query(
      'SELECT * FROM article_categories WHERE id = ?', 
      [id]
    );
    if (updatedCategory.length === 0) {
      throw new ApiError(404, '分类不存在');
    }
    return updatedCategory[0];
  }

  async deleteCategory(id) {
    const [result] = await db.query('DELETE FROM article_categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      throw new ApiError(404, '分类不存在');
    }
    return true;
  }

  // ===================================
  // Article Management
  // ===================================

  async getArticles(params) {
    const { page = 1, limit = 10, keyword, category, status, sort = 'latest' } = params;
    const offset = (page - 1) * limit;

    // Basic query with joins
    const [articles] = await db.query(`
      SELECT a.*, u.username as authorName, ac.name as categoryName 
      FROM articles a 
      JOIN users u ON a.author_id = u.id 
      JOIN article_categories ac ON a.category_id = ac.id 
      ORDER BY a.created_at DESC 
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);

    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM articles');
    
    return { items: articles, total };
  }

  async getArticleById(id, userId = null) {
    // Build query based on whether user is authenticated
    const query = `
      SELECT 
        a.*, 
        u.username AS authorName, 
        ac.name AS categoryName,
        (SELECT COUNT(*) FROM article_comments WHERE article_id = a.id) AS commentCount,
        (SELECT COUNT(*) FROM user_article_likes WHERE article_id = a.id) AS likeCount,
        ${userId ? `(SELECT COUNT(*) FROM user_article_likes WHERE article_id = a.id AND user_id = ?) > 0` : 'false'} AS isLiked,
        ${userId ? `(SELECT COUNT(*) FROM user_article_favorites WHERE article_id = a.id AND user_id = ?) > 0` : 'false'} AS isFavorited
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN article_categories ac ON a.category_id = ac.id
      WHERE a.id = ?;
    `;
    
    const queryParams = userId ? [userId, userId, id] : [id];
    const [articles] = await db.query(query, queryParams);

    if (articles.length === 0) {
      throw new ApiError(404, '文章不存在');
    }
    
    const article = articles[0];
    // Convert boolean fields from 0/1 to true/false
    article.isLiked = !!article.isLiked;
    article.isFavorited = !!article.isFavorited;

    return article;
  }

  async createArticle(data, authorId) {
    const { title, content, categoryId, status = 'published', summary, cover, tags } = data;
    if (!title || !content || !categoryId) {
      throw new ApiError(400, '标题、内容和分类ID不能为空');
    }

    const [result] = await db.query(
      'INSERT INTO articles (title, content, summary, cover, author_id, category_id, status, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, content, summary || '', cover || '', authorId, categoryId, status, JSON.stringify(tags || [])]
    );
    
    const [newArticle] = await db.query('SELECT * FROM articles WHERE id = ?', [result.insertId]);
    return newArticle[0];
  }

  // ===================================
  // Article Comments
  // ===================================

  async getArticleComments(articleId, params) {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const [comments] = await db.query(`
      SELECT c.*, u.username, u.avatar 
      FROM article_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.article_id = ?
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [articleId, parseInt(limit), offset]);

    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM article_comments WHERE article_id = ?', 
      [articleId]
    );
    
    return { items: comments, total };
  }

  async createComment(articleId, userId, data) {
    const { content, parentId = null } = data;
    if (!content) {
      throw new ApiError(400, '评论内容不能为空');
    }
    
    // Verify article exists
    const [[article]] = await db.query('SELECT id FROM articles WHERE id = ?', [articleId]);
    if (!article) {
      throw new ApiError(404, '关联的文章不存在');
    }

    const [result] = await db.query(
      'INSERT INTO article_comments (article_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)',
      [articleId, userId, content, parentId]
    );
    
    const [newComments] = await db.query(
      'SELECT c.*, u.username, u.avatar FROM article_comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?', 
      [result.insertId]
    );

    return newComments[0];
  }

  // ===================================
  // Article Interactions
  // ===================================

  async toggleLike(articleId, userId) {
    const [[like]] = await db.query(
      'SELECT * FROM user_article_likes WHERE user_id = ? AND article_id = ?', 
      [userId, articleId]
    );

    if (like) {
      await db.query(
        'DELETE FROM user_article_likes WHERE user_id = ? AND article_id = ?', 
        [userId, articleId]
      );
    } else {
      await db.query(
        'INSERT INTO user_article_likes (user_id, article_id) VALUES (?, ?)', 
        [userId, articleId]
      );
    }
    
    const liked = !like;
    const [[{ likeCount }]] = await db.query(
      'SELECT COUNT(*) as likeCount FROM user_article_likes WHERE article_id = ?', 
      [articleId]
    );
    
    return { liked, likeCount };
  }

  async toggleFavorite(articleId, userId) {
    const [[favorite]] = await db.query(
      'SELECT * FROM user_article_favorites WHERE user_id = ? AND article_id = ?', 
      [userId, articleId]
    );

    if (favorite) {
      await db.query(
        'DELETE FROM user_article_favorites WHERE user_id = ? AND article_id = ?', 
        [userId, articleId]
      );
    } else {
      await db.query(
        'INSERT INTO user_article_favorites (user_id, article_id) VALUES (?, ?)', 
        [userId, articleId]
      );
    }
    
    const favorited = !favorite;
    return { favorited };
  }
}

module.exports = new ContentService();