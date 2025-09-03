// 诊断导入阻塞问题
console.log('🔍 Starting import diagnosis...');

const modules = [
  './config',
  './utils/logger', 
  './utils/ApiError',
  './utils/responseHandler',
  './middleware/validation',
  './middleware/monitoring',
  './config/database-adapter',
  './routes/auth',
  './routes/user',
  './routes/question',
  './routes/admin',
  './routes/content',
  './routes/study',
  './routes/knowledge',
  './routes/system',
  './routes/search',
  './routes/checkin'
];

for (const modulePath of modules) {
  try {
    console.log(`Testing: ${modulePath}`);
    require(modulePath);
    console.log(`✅ ${modulePath} - OK`);
  } catch (error) {
    console.log(`❌ ${modulePath} - ERROR: ${error.message}`);
    break; // 在第一个错误处停止
  }
}

console.log('Diagnosis completed.');