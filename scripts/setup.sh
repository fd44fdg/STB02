#!/bin/bash

# 掌上刷题系统初始化脚本

set -e

echo "🔧 初始化掌上刷题系统..."

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node_version=$(node -v)
echo "Node.js 版本: $node_version"

if ! node -e "process.exit(process.version.match(/v(\d+)/)[1] >= 16 ? 0 : 1)"; then
    echo "❌ 需要 Node.js 16 或更高版本"
    exit 1
fi

# 检查 npm 版本
echo "📋 检查 npm 版本..."
npm_version=$(npm -v)
echo "npm 版本: $npm_version"

# 复制环境变量文件
echo "📄 设置环境变量文件..."
if [ ! -f .env ]; then
    cp .env.development .env
    echo "✅ 已复制开发环境配置"
fi

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env 2>/dev/null || echo "⚠️  backend/.env.example 不存在"
fi

# 安装依赖
echo "📦 安装项目依赖..."
npm run install:all

# 检查数据库连接
echo "🗄️  检查数据库连接..."
cd backend
npm run db:check || echo "⚠️  数据库连接失败，请检查配置"
cd ..

# 初始化数据库
echo "🗄️  初始化数据库..."
cd backend
npm run db:init || echo "⚠️  数据库初始化失败"
cd ..

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p backend/public/uploads
mkdir -p backend/logs
mkdir -p test/uploads

echo "✅ 初始化完成！"
echo ""
echo "🚀 快速开始:"
echo "  npm run dev          # 启动开发环境"
echo "  npm run test         # 运行测试"
echo "  npm run build        # 构建项目"
echo ""
echo "📚 更多信息请查看 README.md"