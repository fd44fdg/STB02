#!/bin/bash

# 掌上刷题宝开发环境启动脚本

# 设置错误时退出
set -e

# 加载环境变量
echo "加载开发环境变量..."
export $(grep -v '^#' .env.development | xargs)

# 启动数据库容器
echo "启动开发环境数据库..."
docker-compose -f docker-compose.development.yml up -d

# 等待数据库启动
echo "等待数据库启动..."
sleep 5

# 安装依赖
echo "安装后端依赖..."
cd backend
npm install
cd ..

echo "安装管理后台依赖..."
cd admin-panel
npm install
cd ..

echo "安装移动端依赖..."
cd zhangshang-shuati-app
npm install
cd ..

# 执行数据库迁移
echo "执行数据库迁移..."
cd backend
node scripts/migrate.js
cd ..

# 启动后端服务
echo "启动后端服务..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# 启动管理后台
echo "启动管理后台..."
cd admin-panel
npm run serve &
ADMIN_PID=$!
cd ..

# 启动移动端H5
echo "启动移动端H5..."
cd zhangshang-shuati-app
npm run dev:h5 &
MOBILE_PID=$!
cd ..

# 显示服务信息
echo ""
echo "开发环境已启动:"
echo "后端API: http://localhost:${PORT:-3000}/api/v1"
echo "管理后台: http://localhost:8080"
echo "移动端H5: http://localhost:8081"
echo "数据库管理: http://localhost:8082"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 捕获中断信号
trap "kill $BACKEND_PID $ADMIN_PID $MOBILE_PID; echo '停止所有服务'; exit" INT

# 等待所有进程完成
wait