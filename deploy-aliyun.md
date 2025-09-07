# 阿里云一键部署（stb02.top / 8.130.90.245）

本指引用于在 ECS(中国大陆) 上部署本项目（同域反代，HTTPS，Cookie 会话）。

域名：stb02.top（你已提供）
公网IP：8.130.90.245（你已提供）
地域：大陆（需要 ICP 备案，域名接入后再启用 HTTPS）
证书：阿里云（在证书控制台申请后下载到仓库 nginx/ssl/cert.pem 和 key.pem）
登录：SSH 公钥方式

## 0. 服务器准备
- 系统建议：Ubuntu 22.04 LTS
- 安全组开放：22、80、443
- 安装 Docker & Compose
  ```bash
  curl -fsSL https://get.docker.com | bash
  sudo usermod -aG docker $USER && newgrp docker
  ```

## 1. 克隆代码并进入目录
```bash
sudo mkdir -p /opt/shuati && cd /opt/shuati
# 将代码上传/同步到此目录（或使用 git clone）
```

## 2. 生成 .env.production（同域 /api）
根目录创建 .env.production：
```env
PORT=3000
ADMIN_PORT=8080
MOBILE_PORT=8081
DB_HOST=db
DB_PORT=3306
DB_USER=app_user
DB_PASSWORD=请替换为强密码
DB_NAME=zhangshang_shuati
JWT_SECRET=请替换为超长随机串
CORS_ORIGINS=https://stb02.top,https://www.stb02.top
```

backend/.env（可选，若需要单独配置）可参考 backend/.env.example。

## 3. 配置 Nginx（同域反代 + HTTPS）
- 将你的证书放到 nginx/ssl/cert.pem 和 nginx/ssl/key.pem
- 修改 nginx/conf.d/default.conf：将 server_name 从 localhost 改为 stb02.top（我已在 PR 准备模板，会自动替换）
- 开启 HTTPS server 块（取消注释）并保留 80 -> 443 跳转

## 4. 首次部署
```bash
docker compose -f docker-compose.production.yml up -d --build
```

## 5. 验收
- 管理后台：https://stb02.top/admin/
- H5：https://stb02.top/
- API 健康：https://stb02.top/api/v1/health

## 6. 微信小程序
- 开发阶段：勾选“不校验合法域名、TLS 版本以及 HTTPS 证书”
- 上线前：将 https://stb02.top 加入“request 合法域名”

## 7. 常见问题
- 502：backend 未就绪，查看日志：
  ```bash
  docker compose -f docker-compose.production.yml logs -f backend
  ```
- 上传 401：确保走 HTTPS + 同域，Cookie Secure 生效
- CORS：生产同域反代，不要跨域

---
如需我代为执行：给我添加 SSH 公钥到 /home/ubuntu/.ssh/authorized_keys，然后我直接登录执行以上步骤。
