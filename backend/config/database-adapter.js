const db = require('./db'); // 引入我们统一的 Knex 实例
const fs = require('fs');
const path = require('path');

async function testConnection() {
  try {
    await db.raw('SELECT 1');
    console.log('✅ 数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    // 如果是 SQLite 且数据库文件不存在，尝试创建目录
    if (error.code === 'SQLITE_CANTOPEN') {
      const dbPath = db.client.config.connection.filename;
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        console.log(`尝试创建数据库目录: ${dbDir}`);
        fs.mkdirSync(dbDir, { recursive: true });
        console.log('目录已创建，请重试服务器启动。');
      }
    }
    return false;
  }
}

async function initDatabase() {
  try {
    console.log('🚀 正在检查数据库状态...');

    // 检查是否已有迁移记录
    const migrationTableExists = await db.schema.hasTable('knex_migrations');

    if (migrationTableExists) {
      // 检查是否有待执行的迁移
      const pendingMigrations = await db.migrate.list();

      if (pendingMigrations[1].length > 0) {
        console.log('🔄 发现待执行的迁移，正在执行...');
        await db.migrate.latest();
        console.log('✅ 数据库迁移完成');
      } else {
        console.log('✅ 数据库已是最新状态，跳过迁移');
      }
    } else {
      // 首次运行，执行迁移
      console.log('🚀 首次运行，正在执行数据库迁移...');
      await db.migrate.latest();
      console.log('✅ 数据库迁移完成');
    }

    return true;
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);

    // 如果是表已存在的错误，尝试继续运行
    if (error.message.includes('already exists')) {
      console.log('⚠️  检测到表已存在，尝试跳过迁移继续运行...');
      return true;
    }

    return false;
  }
}

module.exports = {
  testConnection,
  initDatabase,
};
