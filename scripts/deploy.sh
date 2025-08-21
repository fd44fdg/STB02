#!/bin/bash

# 掌上刷题宝部署脚本
# 用法: ./deploy.sh [环境]
# 环境: production, staging (默认: production)

# 设置错误时退出
set -e

# 获取部署环境
ENV=${1:-production}
echo "开始部署到 $ENV 环境..."

# 设置环境变量文件
ENV_FILE=".env.$ENV"

# 检查环境变量文件是否存在
if [ ! -f "$ENV_FILE" ]; then
  echo "错误: 环境变量文件 $ENV_FILE 不存在!"
  exit 1
fi

# 加载环境变量
echo "加载环境变量..."
export $(grep -v '^#' $ENV_FILE | xargs)

# 构建前端应用
echo "构建管理后台..."
cd admin-panel
npm ci
npm run build
cd ..

echo "构建移动端应用..."
cd zhangshang-shuati-app
npm ci
npm run build:mp-weixin
npm run build:h5
cd ..

# 安装后端依赖
echo "安装后端依赖..."
cd backend
npm ci
cd ..

# 数据库迁移
echo "执行数据库迁移..."
cd backend
node scripts/migrate.js
cd ..

# 启动Docker容器
echo "启动Docker容器..."
docker-compose -f docker-compose.$ENV.yml up -d

# 检查服务是否正常启动
echo "检查服务状态..."
sleep 10
if curl -s "http://localhost:${PORT:-3000}/api/v1/health" | grep -q "OK"; then
  echo "后端服务启动成功!"
else
  echo "警告: 后端服务可能未正常启动，请检查日志"
fi

echo "部署完成!"
echo "管理后台: http://localhost:${ADMIN_PORT:-8080}"
echo "移动端H5: http://localhost:${MOBILE_PORT:-8081}"
echo "后端API: http://localhost:${PORT:-3000}/api/v1"

# 显示日志查看命令
echo ""
echo "查看日志命令:"
echo "后端日志: docker-compose -f docker-compose.$ENV.yml logs -f backend"
echo "管理后台日志: docker-compose -f docker-compose.$ENV.yml logs -f admin-panel"
echo "数据库日志: docker-compose -f docker-compose.$ENV.yml logs -f db"