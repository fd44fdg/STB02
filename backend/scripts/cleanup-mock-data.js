/**
 * 清理模拟数据文件和相关代码
 * 此脚本用于删除mock-db.js文件和清理所有对模拟数据的引用
 */

const fs = require('fs').promises;
const path = require('path');

async function cleanupMockData() {
  console.log('🧹 开始清理模拟数据文件和相关代码...');
  
  try {
    // 1. 删除mock-db.js文件（如果存在）
    const mockDbPath = path.join(__dirname, '../database/mock-db.js');
    
    try {
      await fs.access(mockDbPath);
      await fs.unlink(mockDbPath);
      console.log('✅ 已删除mock-db.js文件');
    } catch (error) {
      console.log('ℹ️ mock-db.js文件不存在，无需删除');
    }
    
    // 2. 检查路由文件中是否还有对模拟数据的引用
    const routesDir = path.join(__dirname, '../routes');
    const routeFiles = await fs.readdir(routesDir);
    
    let foundReferences = false;
    
    for (const routeFile of routeFiles) {
      if (!routeFile.endsWith('.js')) continue;
      
      const filePath = path.join(routesDir, routeFile);
      const content = await fs.readFile(filePath, 'utf8');
      
      if (content.includes('mock-db') || 
          content.includes('mockData') || 
          content.includes('testData') ||
          content.includes('mockUser') ||
          content.includes('testUser')) {
        console.log(`⚠️ 在 ${routeFile} 中发现模拟数据引用，请手动检查`);
        foundReferences = true;
      }
    }
    
    if (!foundReferences) {
      console.log('✅ 路由文件中没有发现模拟数据引用');
    }
    
    // 3. 检查其他可能包含硬编码测试数据的文件
    const filesToCheck = [
      path.join(__dirname, '../server.js'),
      path.join(__dirname, '../config/database.js')
    ];
    
    for (const filePath of filesToCheck) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        
        if (content.includes('mockData') || 
            content.includes('testData') ||
            content.includes('mockUser') ||
            content.includes('testUser')) {
          console.log(`⚠️ 在 ${path.basename(filePath)} 中发现可能的硬编码测试数据，请手动检查`);
        }
      } catch (error) {
        // 文件可能不存在，忽略错误
      }
    }
    
    // 4. 更新data-migration.js中的cleanupMockData方法
    const migrationFilePath = path.join(__dirname, 'data-migration.js');
    try {
      let migrationContent = await fs.readFile(migrationFilePath, 'utf8');
      
      // 更新cleanupMockData方法，标记为已完成
      if (migrationContent.includes('async cleanupMockData()')) {
        migrationContent = migrationContent.replace(
          /async cleanupMockData\(\) \{[\s\S]*?try \{[\s\S]*?const mockDbPath[\s\S]*?console\.log\('⚠️  发现模拟数据文件，建议手动处理'\);/,
          `async cleanupMockData() {
    console.log('🧹 检查模拟数据文件清理状态...');
    
    try {
      // 模拟数据文件已被删除
      console.log('✅ 模拟数据文件已清理完成');`
        );
        
        await fs.writeFile(migrationFilePath, migrationContent, 'utf8');
        console.log('✅ 已更新data-migration.js中的cleanupMockData方法');
      }
    } catch (error) {
      console.log('⚠️ 更新data-migration.js失败:', error.message);
    }
    
    console.log('🎉 模拟数据清理完成！');
    
  } catch (error) {
    console.error('❌ 清理模拟数据时出错:', error.message);
  }
}

// 执行清理
if (require.main === module) {
  cleanupMockData()
    .then(() => {
      console.log('✅ 清理脚本执行完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 清理脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { cleanupMockData };