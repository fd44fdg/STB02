# 掌上刷题宝（生产就绪版）

一个可直接用于生产的在线刷题平台，包含后端 API、管理后台（V2）、H5/微信小程序前端；已经完成登录鉴权统一、上传鉴权统一、离线/Mock 分离、路由异常页与同域反代的生产加固。

- 后端：Node.js + Express + Knex（MySQL/SQLite）
- 管理后台（V2）：Vue 3 + Vite + Pinia + Naive UI（端口 8090 开发，生产同域 /admin）
- H5/小程序：uni-app（H5 走同域根路径 /，微信小程序独立构建）
- 反向代理：Nginx 同域反代（/api -> 后端，/admin -> 管理后台，/ -> H5）

---

## 1. 目录结构

- backend/                 后端 API 服务
- admin-panel-v2/          新版管理后台（推荐）
- admin-panel/             旧版管理后台（保留）
- zhangshang-shuati-app/   H5/小程序前端（uni-app）
- nginx/                   Nginx 生产配置（同域反代）
- docker-compose.production.yml  生产编排（后端、Admin、H5、MySQL、Nginx、phpMyAdmin）

---

## 2. 快速开始（本地开发）

前置：Node 18+、npm 9+；可选 Docker。

### 2.1 后端 API
```
cd backend
cp .env.example .env   # 按需修改数据库、端口等
npm i
npm run dev            # http://localhost:3000/api/v1/health
```

### 2.2 管理后台（V2）
```
cd admin-panel-v2
cp .env.development .env.development  # 按需设置
# 可选：直连你的后端（默认 3001 或你本机端口）
# VITE_API_TARGET=http://localhost:3001
npm i
npm run dev            # http://localhost:8090
```
开发期无需后端想直接进界面，可启用登录 Mock：
```
# admin-panel-v2/.env.development
VITE_DEV_AUTO_MOCK=1
```
离线回退（本地存储种子数据）默认关闭，如需离线浏览：
```
VITE_OFFLINE_FALLBACK=true
```

### 2.3 H5（本地）
```
cd zhangshang-shuati-app
npm i
npm run dev:h5         # 默认端口 8085/8083，依你的配置
```

### 2.4 微信小程序（开发）
- 构建：
```
# 直连你本机后端（如 3001）
cross-env NODE_ENV=development UNI_PLATFORM=mp-weixin VUE_APP_API_BASE_URL=http://localhost:3001/api/v1 npm run dev:mp-weixin
```
- 用微信开发者工具导入 dist/build/mp-weixin 目录，勾选“不校验合法域名、TLS 版本以及 HTTPS 证书”（仅开发）。

---

## 3. 认证与上传（生产统一）
- 管理后台（V2）：统一采用 Cookie 会话（axios withCredentials=true，401 自动刷新与请求队列重放）。
- 上传：前端 UploadImage 使用 Cookie；后端 /api/v1/upload/banners 使用 authV2.verifyAccess + requireRoles('admin') 校验。
- 小程序/H5：uni-app 侧 request.js 使用 Bearer Token（不依赖 Cookie，会话互不影响）。

---

## 4. 运行时配置（后台驱动 H5）
- 后端新增接口：
  - GET /api/v1/system/config    返回运行时配置（公共可读）
  - POST /api/v1/system/config   保存运行时配置（仅管理员，Cookie 会话）
- H5 在启动时通过 src/utils/runtime-config.js 拉取并缓存，可在页面逻辑中通过 getValue('path.to.key', def) 读取，实现“后台改、H5 即生效”。

---

## 5. 生产部署（同域反代）

推荐使用 docker-compose.production.yml 一键起服务（后端、Admin、H5、MySQL、Nginx、phpMyAdmin）。

1) 准备 .env.production（根目录）
```
PORT=3000
ADMIN_PORT=8080
MOBILE_PORT=8081
DB_HOST=db
DB_PORT=3306
DB_USER=app_user
DB_PASSWORD=强密码
DB_NAME=zhangshang_shuati
JWT_SECRET=超长随机串
CORS_ORIGINS=https://你的域名,https://www.你的域名
```

2) Nginx（nginx/conf.d/default.conf）
- /api/ -> backend:3000/api/
- /admin/ -> admin-panel:80
- / -> mobile-app:80
- 启用 HTTPS：将证书放入 nginx/ssl/cert.pem、nginx/ssl/key.pem，取消 https server 段注释，并配置 80->443 跳转。

3) 启动
```
docker compose -f docker-compose.production.yml up -d --build
```

4) 验收
- https://你的域名/api/v1/health
- https://你的域名/admin/
- https://你的域名/

阿里云 ECS 专项指南：见 deploy-aliyun.md。

GitHub Actions 自动部署：.github/workflows/deploy-aliyun.yml（配置 Secrets：ALIYUN_HOST、ALIYUN_USER、ALIYUN_SSH_KEY 等）。

---

## 6. 常见问题（排错）
- 登录超时（开发）：确认 VITE_API_TARGET 指向你的后端端口；或开启 VITE_DEV_AUTO_MOCK=1。
- 401（生产）：确保同域反代 + HTTPS（Cookie Secure 生效）；跨域会导致 Cookie 丢失。
- 上传失败：已统一 Cookie 会话；确保管理后台已登录且 Nginx 反代到后端 /api/v1/upload。
- 小程序网络被拦：生产需在“request 合法域名”添加你的 https 域名；开发可勾选“不校验”。
- 刷新 404：Nginx 需配置 SPA fallback（本配置已按根/H5、/admin/ 前端路由做好）。

---

## 7. 脚本与命令
- 本地后端：`cd backend && npm run dev`
- 本地 Admin V2：`cd admin-panel-v2 && npm run dev`
- 本地 H5：`cd zhangshang-shuati-app && npm run dev:h5`
- 微信小程序（开发）：`cross-env NODE_ENV=development UNI_PLATFORM=mp-weixin VUE_APP_API_BASE_URL=http://localhost:3001/api/v1 npm run dev:mp-weixin`
- 生产部署：`docker compose -f docker-compose.production.yml up -d --build`

---

## 8. 许可证
MIT
