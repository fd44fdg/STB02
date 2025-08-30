const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// 引入统一配置
const config = require('./config');

const { testConnection, initDatabase } = require('./config/database-adapter');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const questionRoutes = require('./routes/question');
const adminRoutes = require('./routes/admin');
const contentRoutes = require('./routes/content');
const studyRoutes = require('./routes/study');
const knowledgeRoutes = require('./routes/knowledge');
const systemRoutes = require('./routes/system');
const searchRoutes = require('./routes/search');
const checkinRoutes = require('./routes/checkin');
const statsRoutes = require('./routes/stats');

const { sendSuccess, sendError } = require('./utils/responseHandler');
const ApiError = require('./utils/ApiError');

const app = express();
const PORT = config.ports.backend;

// 安全中间件
app.use(helmet());

// 跨域配置
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  }
});
app.use(limiter);

// 性能监控中间件已禁用


// 解析请求体
app.use(bodyParser.json({ limit: config.upload.maxSize }));
app.use(bodyParser.urlencoded({ extended: true, limit: config.upload.maxSize }));

// 静态文件服务
app.use('/static', express.static('public'));
app.use('/static/uploads', express.static(path.join(__dirname, 'public/uploads')));

// API路由
const apiPrefix = `${config.api.prefix}/${config.api.version}`;
app.use(`${apiPrefix}`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/questions`, questionRoutes);
app.use(`${apiPrefix}/study`, studyRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/admin/content`, contentRoutes);
app.use(`${apiPrefix}/knowledge`, knowledgeRoutes);
app.use(`${apiPrefix}/system`, systemRoutes);
app.use(`${apiPrefix}/search`, searchRoutes);
app.use(`${apiPrefix}/stats`, statsRoutes);
app.use(`${apiPrefix}`, checkinRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 根路径
app.get('/', (req, res) => {
  sendSuccess(res, {
    name: '掌上刷题宝 API 服务器',
    version: '1.0.0',
    docs: `${apiPrefix}/docs`
  });
});

// 404处理: 将所有未匹配的路由转换为一个404的ApiError
app.use((req, res, next) => {
  next(new ApiError(404, '接口不存在'));
});

// 全局错误处理中间件
const globalErrorHandler = (error, req, res, next) => {
  // 在开发环境中打印详细错误，在生产环境中只记录关键信息
  if (process.env.NODE_ENV === 'development') {
      console.error('💥 An error occurred:', error);
  } else {
      // 在生产环境中，可以集成更成熟的日志库（如Winston）来记录错误
      console.error('💥 An error occurred:', { 
        statusCode: error.statusCode, 
        message: error.message,
        isOperational: error.isOperational 
      });
  }
  
  // 如果错误不是我们预定义的ApiError，则将其转换为一个通用的服务器内部错误
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || '服务器内部错误';
    error = new ApiError(statusCode, message, false, error.stack);
  }
  
  sendError(res, error);
}

app.use(globalErrorHandler);

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库（包含创建数据库和测试连接）
    await initDatabase();
    
    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器已启动`);
      console.log(`📍 地址: http://localhost:${PORT}`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 API文档: http://localhost:${PORT}${apiPrefix}/docs`);
    });
    
  } catch (error) {
    console.error('❌ 服务器启动失败:', error.message);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🛑 收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

// 只在非测试环境下启动服务器
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;