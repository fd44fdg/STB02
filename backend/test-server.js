// 简化的测试服务器
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

// 基础健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({ message: 'Test server is running!' });
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});