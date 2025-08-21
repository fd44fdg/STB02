const mysql = require('mysql2/promise');
require('dotenv').config();

// 引入统一配置
const config = require('./index');

// 数据库配置
const dbConfig = {
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.isTest ? config.database.testName : config.database.name,
  port: config.database.port,
  waitForConnections: true,
  connectionLimit: config.database.connectionLimit || (config.isProd ? 20 : 10),
  queueLimit: 0,
  acquireTimeout: config.database.acquireTimeout || 60000,
  timeout: config.database.timeout || 60000,
  reconnect: config.database.reconnect !== false,
  charset: config.database.charset || 'utf8mb4',
  timezone: config.database.timezone || '+08:00',
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: false,
  multipleStatements: false,
  // SSL配置
  ssl: config.database.ssl || false
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 连接池事件监听
pool.on('connection', (connection) => {
  console.log(`✅ 新数据库连接建立: ${connection.threadId}`);
});

pool.on('error', (error) => {
  console.error('❌ 数据库连接池错误:', error);
  if (error.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 数据库连接丢失，尝试重新连接...');
  }
});

// 连接池监控
setInterval(() => {
  if (process.env.NODE_ENV === 'development' && pool.pool && pool.pool._allConnections) {
    try {
      const poolInfo = {
        totalConnections: pool.pool._allConnections.length || 0,
        freeConnections: pool.pool._freeConnections ? pool.pool._freeConnections.length : 0,
        acquiringConnections: pool.pool._acquiringConnections ? pool.pool._acquiringConnections.length : 0,
        connectionLimit: pool.pool.config ? pool.pool.config.connectionLimit : 0
      };
      
      if (poolInfo.freeConnections < 2) {
        console.warn('⚠️ 数据库连接池可用连接不足:', poolInfo);
      }
    } catch (error) {
      console.warn('⚠️ 监控数据库连接池时出错:', error.message);
    }
  }
}, 30000); // 每30秒检查一次

/**
 * 测试数据库连接
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

/**
 * 初始化数据库
 * @returns {Promise<void>}
 */
async function initDatabase() {
  try {
    // 测试连接
    const connected = await testConnection();
    if (!connected) {
      throw new Error('无法连接到数据库');
    }
    
    // 在这里可以添加数据库初始化逻辑
    // 例如创建表、初始化数据等
    
    console.log('✅ 数据库初始化完成');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    throw error;
  }
}

/**
 * 执行SQL查询
 * @param {string} sql SQL语句
 * @param {Array} params 参数
 * @returns {Promise<Array>} 查询结果
 */
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('SQL查询错误:', error.message);
    console.error('SQL语句:', sql);
    console.error('参数:', params);
    throw error;
  }
}

/**
 * 获取单个结果
 * @param {string} sql SQL语句
 * @param {Array} params 参数
 * @returns {Promise<Object|null>} 查询结果
 */
async function getOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * 插入数据
 * @param {string} table 表名
 * @param {Object} data 数据对象
 * @returns {Promise<Object>} 插入结果
 */
async function insert(table, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  
  try {
    const [result] = await pool.execute(sql, values);
    return {
      id: result.insertId,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    console.error('插入数据错误:', error.message);
    throw error;
  }
}

/**
 * 更新数据
 * @param {string} table 表名
 * @param {Object} data 数据对象
 * @param {Object} where 条件对象
 * @returns {Promise<Object>} 更新结果
 */
async function update(table, data, where) {
  const dataKeys = Object.keys(data);
  const dataValues = Object.values(data);
  
  const whereKeys = Object.keys(where);
  const whereValues = Object.values(where);
  
  const setClause = dataKeys.map(key => `${key} = ?`).join(', ');
  const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');
  
  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  
  try {
    const [result] = await pool.execute(sql, [...dataValues, ...whereValues]);
    return {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows
    };
  } catch (error) {
    console.error('更新数据错误:', error.message);
    throw error;
  }
}

/**
 * 删除数据
 * @param {string} table 表名
 * @param {Object} where 条件对象
 * @returns {Promise<Object>} 删除结果
 */
async function remove(table, where) {
  const whereKeys = Object.keys(where);
  const whereValues = Object.values(where);
  
  const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');
  
  const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
  
  try {
    const [result] = await pool.execute(sql, whereValues);
    return {
      affectedRows: result.affectedRows
    };
  } catch (error) {
    console.error('删除数据错误:', error.message);
    throw error;
  }
}

// 导出数据库操作函数
module.exports = {
  pool,
  testConnection,
  initDatabase,
  query,
  getOne,
  insert,
  update,
  remove
};