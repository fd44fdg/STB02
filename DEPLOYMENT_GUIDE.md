# 掌上刷题宝项目部署指南

## 项目概述

掌上刷题宝是一个完整的在线学习平台，包含：
- **微信小程序端**：学生使用的移动学习平台
- **后台管理系统**：管理员使用的Web管理界面  
- **后端API服务**：提供数据接口和业务逻辑

## 项目结构

```
E:\xmwj_02\
├── zhangshang-shuati-app/     # 微信小程序前端
├── admin-panel/               # 后台管理系统
├── backend/                   # 后端API服务
├── db/                        # 数据库初始化脚本
├── nginx/                     # Nginx配置
└── docker-compose.*.yml       # Docker编排文件
```

## 环境要求

### 开发环境
- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL >= 8.0 或 SQLite3
- 微信开发者工具

### 生产环境
- Docker >= 20.0
- Docker Compose >= 2.0
- Nginx >= 1.20
- SSL证书（用于HTTPS）

## 快速开始

### 1. 本地开发环境搭建

#### 安装依赖
```bash
# 后端服务
cd backend
npm install

# 后台管理系统
cd ../admin-panel
npm install

# 微信小程序
cd ../zhangshang-shuati-app
npm install
```

#### 数据库初始化
```bash
# 使用MySQL
mysql -u root -p < db/init.sql

# 或使用SQLite（开发环境）
cd backend
npm run init:db
```

#### 启动服务

1. **启动后端服务**
```bash
cd backend
npm run dev
# 服务运行在 http://localhost:3000
```

2. **启动后台管理系统**
```bash
cd admin-panel
npm run dev
# 管理后台运行在 http://localhost:8080
```

3. **启动微信小程序**
```bash
cd zhangshang-shuati-app
npm run dev:mp-weixin
# 编译输出到 dist/dev/mp-weixin
```

### 2. 微信小程序开发

#### 导入项目
1. 打开微信开发者工具
2. 选择"导入项目"
3. 项目路径：`E:\xmwj_02\zhangshang-shuati-app\dist\dev\mp-weixin`
4. AppID：填写你的微信小程序AppID

#### 配置说明
- 修改 `zhangshang-shuati-app/src/config/index.js` 中的API地址
- 配置微信小程序的域名白名单
- 设置支付和其他第三方服务

## 生产环境部署

### 方案一：Docker容器化部署（推荐）

#### 1. 构建和启动所有服务
```bash
# 生产环境
docker-compose -f docker-compose.production.yml up -d

# 开发环境
docker-compose -f docker-compose.development.yml up -d
```

#### 2. 服务访问地址
- 后台管理系统：https://your-domain.com/admin/
- API服务：https://your-domain.com/api/
- 静态资源：https://your-domain.com/static/

### 方案二：传统服务器部署

#### 1. 服务器准备
```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 安装 Nginx
sudo apt-get install nginx
```

#### 2. 部署后端服务
```bash
cd backend
npm install --production
pm2 start server.js --name "shuati-backend"
```

#### 3. 构建并部署前端
```bash
# 构建后台管理系统
cd admin-panel
npm run build
sudo cp -r dist/* /var/www/admin/

# 构建微信小程序
cd ../zhangshang-shuati-app
npm run build:mp-weixin
# 手动上传到微信公众平台
```

#### 4. 配置Nginx
```bash
sudo cp nginx/conf.d/default.conf /etc/nginx/sites-available/shuati
sudo ln -s /etc/nginx/sites-available/shuati /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 环境变量配置

### 后端环境变量 (backend/.env)
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=shuati_db
DB_USER=your_db_user
DB_PASS=your_db_password
JWT_SECRET=your_jwt_secret_key
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
```

### 前端环境变量 (admin-panel/.env.production)
```env
VUE_APP_BASE_API=https://your-domain.com/api
VUE_APP_API_BASE_URL=https://your-domain.com/api/v1
```

### 小程序配置 (zhangshang-shuati-app/src/config/index.js)
```javascript
const config = {
  production: {
    api: {
      baseUrl: 'https://your-domain.com/api/v1'
    }
  }
}
```

## 数据库配置

### MySQL生产环境
```sql
-- 创建数据库
CREATE DATABASE shuati_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'shuati_user'@'%' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON shuati_db.* TO 'shuati_user'@'%';
FLUSH PRIVILEGES;

-- 导入表结构
source db/init.sql;
```

### 数据库连接池配置
```javascript
// backend/config/database.js
module.exports = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  dialect: 'mysql',
  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000
  }
}
```

## SSL证书配置

### 使用Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
sudo certbot renew --dry-run
```

### 手动配置SSL
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

## 监控和日志

### PM2监控
```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs shuati-backend

# 监控面板
pm2 monit

# 重启服务
pm2 restart shuati-backend
```

### Nginx日志
```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log
```

## 性能优化

### 1. 数据库优化
- 创建适当的索引
- 使用连接池
- 定期清理日志表

### 2. 静态资源优化
- 启用Gzip压缩
- 配置浏览器缓存
- 使用CDN加速

### 3. 应用层优化
- Redis缓存热点数据
- 数据库查询优化
- 图片压缩和懒加载

## 安全配置

### 1. 服务器安全
```bash
# 更新系统
sudo apt update && sudo apt upgrade

# 配置防火墙
sudo ufw enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# 禁用root登录
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
```

### 2. 应用安全
- 使用强密码策略
- 启用CORS保护
- 实施API频率限制
- 定期更新依赖包

## 备份策略

### 数据库备份
```bash
#!/bin/bash
# backup.sh
DB_NAME="shuati_db"
BACKUP_DIR="/backup/mysql"
DATE=$(date +%Y%m%d_%H%M%S)

mysqldump -u backup_user -p$BACKUP_PASS $DB_NAME > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

# 添加到crontab
# 0 2 * * * /path/to/backup.sh
```

### 代码备份
```bash
# 使用Git进行版本管理
git add .
git commit -m "Production deployment $(date)"
git push origin main
```

## 故障排除

### 常见问题

1. **端口被占用**
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

2. **数据库连接失败**
```bash
# 检查数据库状态
sudo systemctl status mysql
# 重启数据库
sudo systemctl restart mysql
```

3. **Nginx配置错误**
```bash
# 测试配置
sudo nginx -t
# 重新加载配置
sudo systemctl reload nginx
```

4. **PM2进程异常**
```bash
# 重启所有进程
pm2 restart all
# 清理日志
pm2 flush
```

## 更新部署

### 零停机更新
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装新依赖
npm install --production

# 3. 平滑重启
pm2 reload shuati-backend

# 4. 更新前端资源
npm run build
sudo cp -r dist/* /var/www/admin/
```

## 技术支持

如果遇到部署问题，请检查：
1. 所有服务的日志文件
2. 网络连接和防火墙设置
3. 环境变量配置
4. 数据库连接状态

更多问题请参考项目文档或联系技术支持团队。

---

部署完成后，请及时删除敏感的配置文件和测试数据，确保生产环境安全。