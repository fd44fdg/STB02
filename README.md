# 掌上刷题宝

一个完整的在线刷题平台，帮助用户随时随地进行技术学习和练习。

## 项目结构

- **backend**: Node.js + Express + MySQL 后端服务
- **admin-panel**: Vue 3 + Element Plus 管理后台
- **zhangshang-shuati-app**: uni-app 移动端应用（支持微信小程序、H5等多平台）

## 功能特点

- 用户注册登录（支持账号密码和微信小程序登录）
- 题目浏览和答题
- 收藏功能
- 错题本管理
- 学习记录统计
- 管理后台（题目管理、用户管理等）

## 技术栈

### 后端

- Node.js + Express
- MySQL 数据库
- JWT 认证
- RESTful API

### 管理后台

- Vue 3
- Element Plus
- Vuex
- Vue Router
- Axios

### 移动端

- uni-app
- Vuex
- 微信小程序API

## 开发环境搭建

### 前提条件

- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL >= 8.0
- Docker 和 Docker Compose (可选)

### 安装依赖

```bash
# 安装所有项目依赖
npm run install:all

# 或者分别安装
npm install                           # 根目录依赖
cd backend && npm install             # 后端依赖
cd ../admin-panel && npm install      # 管理后台依赖
cd ../zhangshang-shuati-app && npm install  # 移动端依赖
```

### 配置环境变量

复制环境变量示例文件并根据需要修改：

```bash
cp .env.development.example .env.development
cp .env.production.example .env.production
cp .env.test.example .env.test
```

### 启动开发环境

#### 方法一：使用脚本（推荐）

```bash
# 使脚本可执行
chmod +x scripts/start-dev.sh

# 启动开发环境
./scripts/start-dev.sh
```

#### 方法二：手动启动

```bash
# 启动数据库容器
docker-compose -f docker-compose.development.yml up -d

# 执行数据库迁移
cd backend && node scripts/migrate.js

# 启动后端服务
cd backend && npm run dev

# 启动管理后台（新终端）
cd admin-panel && npm run serve

# 启动移动端H5（新终端）
cd zhangshang-shuati-app && npm run dev:h5
```

### 访问服务

- 后端API: http://localhost:3000/api/v1
- 管理后台: http://localhost:8080
- 移动端H5: http://localhost:8081
- 数据库管理: http://localhost:8082

## 生产环境部署

### 使用Docker Compose部署

```bash
# 使脚本可执行
chmod +x scripts/deploy.sh

# 部署到生产环境
./scripts/deploy.sh production
```

### 手动部署

```bash
# 构建管理后台
cd admin-panel && npm run build

# 构建移动端应用
cd zhangshang-shuati-app
npm run build:mp-weixin  # 微信小程序
npm run build:h5         # H5版本

# 启动Docker容器
docker-compose -f docker-compose.production.yml up -d
```

## 微信小程序部署

请参考 [小程序部署指南](小程序部署指南.md) 了解如何将应用部署到微信小程序平台。

## 测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行E2E测试
npm run test:e2e
```

详细的测试说明请参考 [测试指南](README-TESTING.md)。

## API文档

API文档请参考 [API文档](docs/api.md)。

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

MIT