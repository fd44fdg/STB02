const db = require('../config/db');
const ApiError = require('../utils/ApiError');

class KnowledgeService {
  // ===================================
  // Knowledge Categories
  // ===================================

  async getCategories() {
    const [categories] = await db.query(`
      SELECT c.*, COUNT(p.id) as pointCount 
      FROM knowledge_categories c 
      LEFT JOIN knowledge_points p ON c.id = p.category_id 
      GROUP BY c.id
    `);
    return { items: categories, total: categories.length };
  }

  async createCategory(data) {
    const { name, description, sort = 0, status = 1 } = data;
    if (!name) throw new ApiError(400, '分类名称不能为空');

    const [result] = await db.execute(
      'INSERT INTO knowledge_categories (name, description, sort, status) VALUES (?, ?, ?, ?)', 
      [name, description || '', sort, status]
    );
    
    const newCategory = await db.getOne(
      'SELECT * FROM knowledge_categories WHERE id = ?', 
      [result.insertId]
    );
    
    return newCategory;
  }

  async deleteCategory(id) {
    const countResult = await db.getOne(
      'SELECT COUNT(*) as count FROM knowledge_points WHERE category_id = ?', 
      [id]
    );
    
    if (countResult && countResult.count > 0) {
      throw new ApiError(400, '该分类下仍有知识点，无法删除');
    }

    const [result] = await db.execute('DELETE FROM knowledge_categories WHERE id = ?', [id]);
    if (!result || result.affectedRows === 0) {
      throw new ApiError(404, '分类不存在');
    }
    
    return true;
  }

  // ===================================
  // Knowledge Points
  // ===================================

  async getPoints(params) {
    const { page = 1, limit = 10, category_id } = params;
    
    let query = 'SELECT p.*, c.name as category_name FROM knowledge_points p LEFT JOIN knowledge_categories c ON p.category_id = c.id';
    let countQuery = 'SELECT COUNT(*) as total FROM knowledge_points';
    const queryParams = [];

    if (category_id) {
      query += ' WHERE p.category_id = ?';
      countQuery += ' WHERE category_id = ?';
      queryParams.push(category_id);
    }
    
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    const finalParams = [...queryParams, parseInt(limit), (page - 1) * limit];

    const [points] = await db.query(query, finalParams);
    const totalResult = await db.getOne(countQuery, queryParams);

    return { 
      items: points, 
      total: totalResult ? totalResult.total : 0 
    };
  }

  async getPointById(id) {
    const point = await db.getOne(
      'SELECT p.*, c.name as category_name FROM knowledge_points p LEFT JOIN knowledge_categories c ON p.category_id = c.id WHERE p.id = ?', 
      [id]
    );
    
    if (!point) throw new ApiError(404, '知识点不存在');
    return point;
  }

  async createPoint(data) {
    const { name, category_id, difficulty, description, content, status } = data;
    
    if (!name || !category_id || !difficulty) {
      throw new ApiError(400, '名称、分类和难度为必填项');
    }
    
    const [result] = await db.execute(
      `INSERT INTO knowledge_points (name, category_id, difficulty, description, content, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, category_id, difficulty, description || '', content || '', status !== undefined ? status : 1]
    );
    
    const newPoint = await db.getOne(
      'SELECT * FROM knowledge_points WHERE id = ?', 
      [result.insertId]
    );
    
    return newPoint;
  }

  async updatePoint(id, data) {
    const { name, category_id, difficulty, description, content, status } = data;
    
    // Check if point exists
    const existingPoint = await db.getOne('SELECT id FROM knowledge_points WHERE id = ?', [id]);
    if (!existingPoint) {
      throw new ApiError(404, '知识点不存在');
    }
    
    const updateFields = [];
    const updateValues = [];
    
    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    
    if (category_id !== undefined) {
      updateFields.push('category_id = ?');
      updateValues.push(category_id);
    }
    
    if (difficulty !== undefined) {
      updateFields.push('difficulty = ?');
      updateValues.push(difficulty);
    }
    
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    
    if (content !== undefined) {
      updateFields.push('content = ?');
      updateValues.push(content);
    }
    
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    
    if (updateFields.length === 0) {
      throw new ApiError(400, '没有要更新的字段');
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);
    
    await db.execute(
      `UPDATE knowledge_points SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    return await this.getPointById(id);
  }

  async deletePoint(id) {
    const [result] = await db.execute('DELETE FROM knowledge_points WHERE id = ?', [id]);
    if (!result || result.affectedRows === 0) {
      throw new ApiError(404, '知识点不存在');
    }
    return true;
  }
}

module.exports = new KnowledgeService();