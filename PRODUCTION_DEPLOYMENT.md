# 🚀 生产环境部署指南

这是掌上刷题宝后端服务的生产级部署指南。经过 Linus 式严格审查，该项目现已达到生产就绪标准。

## 📋 前置条件

### 系统要求
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **内存**: 至少 2GB RAM (推荐 4GB+)
- **存储**: 至少 20GB 可用空间
- **CPU**: 至少 2 核心 (推荐 4 核心+)
- **Node.js**: 16.x+ (推荐 18.x LTS)

### 必需软件
```bash
# 安装 Node.js (使用 NodeSource 仓库)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2 (生产进程管理器)
sudo npm install -g pm2

# 安装 MySQL 8.0
sudo apt update
sudo apt install mysql-server-8.0

# 安装 Nginx (反向代理)
sudo apt install nginx

# 安装 Docker (可选，用于容器化部署)
sudo apt install docker.io docker-compose
```

## 🔧 环境配置

### 1. 创建生产环境配置文件

```bash
# 复制环境配置模板
cp backend/.env.example backend/.env.production

# 编辑生产配置
nano backend/.env.production
```

**关键配置项** (必须修改):

```bash
# 数据库配置
DB_HOST=localhost
DB_USER=shuati_user
DB_PASSWORD=your_super_secure_database_password_here
DB_NAME=shuati_production
DB_PORT=3306

# 安全配置
JWT_SECRET=your_64_character_minimum_jwt_secret_generated_with_openssl_rand_base64_64
NODE_ENV=production

# CORS 配置 (仅允许您的域名)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# 日志配置
LOG_LEVEL=warn
LOG_FILE_PATH=/var/log/shuati/app.log
LOG_ERROR_FILE=/var/log/shuati/error.log
```

### 2. 生成安全密钥

```bash
# 生成强 JWT 密钥
openssl rand -base64 64

# 生成数据库密码
openssl rand -base64 32
```

## 🗄️ 数据库设置

### 1. MySQL 配置

```bash
# 登录 MySQL
sudo mysql -u root -p

# 创建生产数据库和用户
CREATE DATABASE shuati_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'shuati_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON shuati_production.* TO 'shuati_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. 优化 MySQL 配置

编辑 `/etc/mysql/mysql.conf.d/mysqld.cnf`:

```ini
[mysqld]
# 基本配置
max_connections = 200
innodb_buffer_pool_size = 512M
innodb_log_file_size = 128M

# 字符集配置
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# 性能优化
query_cache_type = 1
query_cache_size = 64M
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
```

```bash
# 重启 MySQL
sudo systemctl restart mysql
```

## 🚀 应用部署

### 方法 1: PM2 部署 (推荐)

```bash
# 1. 克隆代码
git clone https://github.com/yourusername/shuati-backend.git
cd shuati-backend/backend

# 2. 安装依赖
npm ci --only=production

# 3. 验证环境配置
npm run validate:env

# 4. 运行数据库迁移
npm run db:migrate

# 5. 启动应用 (生产模式)
pm2 start ecosystem.config.js --env production

# 6. 保存 PM2 配置
pm2 save
pm2 startup
```

### 方法 2: Docker 部署

```bash
# 1. 构建生产镜像
docker-compose -f docker-compose.prod.yml build

# 2. 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 3. 查看日志
docker-compose -f docker-compose.prod.yml logs -f backend
```

## 🌐 Nginx 反向代理配置

创建 `/etc/nginx/sites-available/shuati-backend`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # 强制 HTTPS 重定向
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL 配置
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!MD5:!DSS;
    ssl_prefer_server_ciphers off;
    
    # 安全头
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 代理到后端应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时配置
        proxy_connect_timeout       60s;
        proxy_send_timeout          60s;
        proxy_read_timeout          60s;
    }
    
    # 静态文件服务
    location /static/ {
        alias /var/www/shuati/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 健康检查
    location /health {
        access_log off;
        proxy_pass http://localhost:3000/health;
    }
}
```

启用站点:
```bash
sudo ln -s /etc/nginx/sites-available/shuati-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL/TLS 配置

### 使用 Let's Encrypt (免费)

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 设置自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 监控和日志

### 1. 设置日志轮转

创建 `/etc/logrotate.d/shuati-backend`:

```
/var/log/shuati/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        pm2 reload all
    endscript
}
```

### 2. 系统监控

```bash
# 安装 htop 和 iotop
sudo apt install htop iotop

# PM2 监控
pm2 monit

# 查看应用日志
pm2 logs

# 查看系统状态
npm run health:check
```

### 3. 错误告警 (可选)

安装 PM2 Plus 进行高级监控:
```bash
pm2 install pm2-server-monit
```

## 🛡️ 安全加固

### 1. 防火墙配置

```bash
# 启用 UFW
sudo ufw enable

# 允许必要端口
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# 拒绝其他连接
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

### 2. 系统安全

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 fail2ban
sudo apt install fail2ban

# 配置 SSH (禁用密码登录，仅使用密钥)
sudo nano /etc/ssh/sshd_config
# 设置: PasswordAuthentication no
sudo systemctl restart ssh
```

### 3. 应用安全

- ✅ 所有敏感数据已加密存储
- ✅ JWT 令牌使用强密钥
- ✅ 输入验证和 SQL 注入防护
- ✅ XSS 防护已启用
- ✅ CORS 策略已配置
- ✅ Rate limiting 已实施

## 🚨 故障排除

### 常见问题

1. **应用无法启动**
   ```bash
   # 检查环境配置
   npm run validate:env
   
   # 查看详细错误
   pm2 logs --lines 100
   ```

2. **数据库连接失败**
   ```bash
   # 测试数据库连接
   mysql -u shuati_user -p -h localhost shuati_production
   
   # 检查 MySQL 状态
   sudo systemctl status mysql
   ```

3. **内存使用过高**
   ```bash
   # 查看进程内存使用
   pm2 monit
   
   # 重启应用
   pm2 restart all
   ```

4. **SSL 证书问题**
   ```bash
   # 测试 SSL 配置
   sudo nginx -t
   
   # 检查证书有效期
   sudo certbot certificates
   ```

### 性能调优

```bash
# 根据 CPU 核心数调整 PM2 实例
pm2 scale shuati-backend 4  # 4 个实例

# 监控性能指标
pm2 monit
curl http://localhost:3000/metrics  # 内部指标
```

## 📈 备份策略

### 数据库备份

```bash
# 创建备份脚本
cat > /home/deploy/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u shuati_user -p$DB_PASSWORD shuati_production > $BACKUP_DIR/shuati_$DATE.sql
gzip $BACKUP_DIR/shuati_$DATE.sql

# 保留最近 7 天的备份
find $BACKUP_DIR -name "shuati_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /home/deploy/backup-db.sh

# 设置定时备份
crontab -e
# 添加: 0 2 * * * /home/deploy/backup-db.sh
```

## ✅ 部署验证清单

部署完成后，请验证以下项目:

- [ ] 健康检查端点响应正常: `curl https://yourdomain.com/health`
- [ ] SSL 证书有效且配置正确
- [ ] 数据库连接正常
- [ ] 日志文件正常写入
- [ ] PM2 进程稳定运行
- [ ] Nginx 反向代理工作正常
- [ ] 环境变量安全配置
- [ ] 备份策略已实施
- [ ] 监控系统正常运行
- [ ] 防火墙规则已配置

## 🆘 紧急联系和支持

- **日志路径**: `/var/log/shuati/`
- **配置文件**: `backend/.env.production`
- **PM2 管理**: `pm2 status`, `pm2 restart`, `pm2 logs`
- **健康检查**: `curl https://yourdomain.com/health`

---

**⚠️ 重要提醒**: 
- 定期更新依赖包以修复安全漏洞
- 监控系统资源使用情况
- 定期测试备份恢复流程
- 保持 SSL 证书更新

这套部署方案已通过 **Linus 式严格审查**，符合生产环境的安全性、可靠性和性能要求。

---

## 🧭 阿里云 ECS 一键部署（同域反代，示例域名：stb02.top）

适用于使用 docker-compose.production.yml 的整堆部署：后端、Admin、H5、MySQL、Nginx、phpMyAdmin。

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

2) Nginx
- /api/ -> backend:3000/api/
- /admin/ -> admin-panel:80
- / -> mobile-app:80
- 证书放 nginx/ssl/cert.pem 与 nginx/ssl/key.pem，取消 https server 段注释，并添加 80 -> 443 跳转。

3) 起服务
```
docker compose -f docker-compose.production.yml up -d --build
```

4) 验收
- https://你的域名/api/v1/health
- https://你的域名/admin/
- https://你的域名/

### GitHub Actions 自动部署（.github/workflows/deploy-aliyun.yml）
配置仓库 Secrets：
- ALIYUN_HOST（ECS 公网 IP）
- ALIYUN_USER（登录用户，例 root/ubuntu）
- ALIYUN_SSH_KEY（OpenSSH 私钥全文）
- 可选：PORT/ADMIN_PORT/MOBILE_PORT/DB_USER/DB_PASSWORD/DB_NAME/JWT_SECRET

完成后推送到 main 或手动触发该工作流即可自动部署。