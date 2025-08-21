/**
 * 用户数据初始化脚本
 * 初始化真实用户数据，包括管理员账户、示例用户和相关统计数据
 */

const { pool } = require('../config/database');
const UserDataGenerator = require('./user-data-generator');

// 初始化真实用户数据
async function initUserData() {
  try {
    console.log('🔄 开始初始化真实用户数据...');
    
    // 检查是否已有管理员用户
    const [existingAdmins] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
    
    if (existingAdmins[0].count > 0) {
      console.log('📊 数据库中已有管理员用户，跳过管理员创建');
    }
    
    // 检查是否已有示例用户
    const [existingUsers] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    
    if (existingUsers[0].count >= 5) {
      console.log('📊 数据库中已有足够的示例用户，跳过用户创建');
      return;
    }
    
    // 使用真实用户数据生成器
    const generator = new UserDataGenerator();
    
    // 生成所有用户数据
    const users = await generator.generateAllUserData();
    
    // 验证用户数据质量
    const isValid = await generator.validateUserData();
    if (!isValid) {
      throw new Error('生成的用户数据质量验证失败');
    }
    
    console.log(`✅ 成功初始化用户数据:`);
    console.log(`   - 管理员账户: ${users.filter(u => u.role === 'admin').length} 个`);
    console.log(`   - 示例用户账户: ${users.filter(u => u.role === 'user').length} 个`);
    console.log(`   - 总用户数: ${users.length} 个`);
    
    // 显示默认账户信息
    console.log('\n📋 默认账户信息:');
    console.log('管理员账户:');
    console.log('  - 用户名: admin, 密码: admin123');
    console.log('  - 用户名: content_admin, 密码: content123');
    console.log('示例用户账户:');
    console.log('  - 用户名: demo_user, 密码: demo123');
    console.log('  - 用户名: student_zhang, 密码: student123');
    console.log('  - 更多用户请查看 README-user-generator.md');
    
  } catch (error) {
    console.error('❌ 初始化真实用户数据失败:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initUserData()
    .then(() => {
      console.log('🎉 真实用户数据初始化完成');
      pool.end();
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 初始化失败:', error);
      pool.end();
      process.exit(1);
    });
}

module.exports = {
  initUserData
};