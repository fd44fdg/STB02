# 微信小程序部署指南

## 📋 部署前检查清单

### 1. 微信开发者账号准备
- [ ] 已注册微信小程序账号
- [ ] 已完成账号认证（个人/企业）
- [ ] 已获取小程序AppID和AppSecret
- [ ] 已配置小程序基本信息（名称、头像、介绍等）

### 2. 服务器和域名准备
- [ ] 已购买并配置服务器（推荐阿里云/腾讯云）
- [ ] 已购买域名并完成备案
- [ ] 已申请SSL证书并配置HTTPS
- [ ] 已在微信后台配置服务器域名

### 3. 数据库准备
- [ ] 已在生产服务器部署MySQL数据库
- [ ] 已执行数据库初始化脚本
- [ ] 已生成真实的题目和文章数据
- [ ] 已配置数据库备份策略

## 🚀 详细部署步骤

### 步骤1: 服务器环境配置

#### 1.1 安装Node.js和PM2
```bash
# 安装Node.js (推荐使用nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# 安装PM2进程管理器
npm install -g pm2
```

#### 1.2 安装MySQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# CentOS/RHEL
sudo yum install mysql-server

# 启动MySQL服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation
```

#### 1.3 安装Nginx
```bash
# Ubuntu/Debian
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 步骤2: 部署后端服务

#### 2.1 上传代码到服务器
```bash
# 使用git克隆代码
git clone https://github.com/your-username/zhangshang-shuati.git
cd zhangshang-shuati

# 或者使用scp上传代码包
scp -r ./backend root@your-server-ip:/var/www/zhangshang-shuati/
```

#### 2.2 安装依赖
```bash
cd /var/www/zhangshang-shuati/backend
npm install --production
```

#### 2.3 配置环境变量
```bash
# 创建生产环境配置文件
cp .env.example .env.production

# 编辑配置文件
vim .env.production
```

生产环境配置示例：
```bash
# 生产环境配置
NODE_ENV=production
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=zhangshang_user
DB_PASSWORD=your_secure_password
DB_NAME=zhangshang_shuati

# JWT配置
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# 微信小程序配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret

# CORS配置
CORS_ORIGINS=https://your-domain.com

# 上传配置
UPLOAD_MAX_SIZE=10mb
UPLOAD_PATH=./uploads
```

#### 2.4 初始化数据库
```bash
# 设置环境变量
export NODE_ENV=production

# 运行数据库初始化脚本
node scripts/setup-database.js
node scripts/add-wechat-fields.js
node scripts/init-data.js
```

#### 2.5 使用PM2启动服务
```bash
# 创建PM2配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'zhangshang-shuati-backend',
    script: 'server.js',
    cwd: '/var/www/zhangshang-shuati/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# 启动服务
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 步骤3: 配置Nginx反向代理

#### 3.1 创建Nginx配置
```bash
# 创建配置文件
sudo vim /etc/nginx/sites-available/zhangshang-shuati
```

Nginx配置示例：
```nginx
server {
    listen 80;
    server_name api.zhangshang-shuati.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.zhangshang-shuati.com;

    # SSL证书配置
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # 反向代理到Node.js应用
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态文件
    location /static/ {
        alias /var/www/zhangshang-shuati/backend/public/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 上传文件
    location /uploads/ {
        alias /var/www/zhangshang-shuati/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 3.2 启用配置
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/zhangshang-shuati /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 步骤4: 配置微信小程序

#### 4.1 更新小程序配置
```javascript
// 更新 zhangshang-shuati-app/project.config.json
{
  "appid": "你的真实小程序AppID",
  // ... 其他配置
}
```

#### 4.2 更新API地址
```javascript
// 更新 zhangshang-shuati-app/src/config/index.js
const config = {
  production: {
    api: {
      baseUrl: 'https://api.zhangshang-shuati.com/api/v1',
      timeout: 15000
    },
    debug: false,
    version: '1.0.0'
  }
  // ... 其他配置
}
```

#### 4.3 在微信后台配置服务器域名
登录微信公众平台 > 开发 > 开发设置 > 服务器域名：
- request合法域名: https://api.zhangshang-shuati.com
- uploadFile合法域名: https://api.zhangshang-shuati.com
- downloadFile合法域名: https://api.zhangshang-shuati.com

### 步骤5: 小程序发布

#### 5.1 使用微信开发者工具
1. 打开微信开发者工具
2. 导入项目（选择 zhangshang-shuati-app 目录）
3. 填入真实的AppID
4. 点击"上传"按钮，填写版本号和项目备注

#### 5.2 在微信后台提交审核
1. 登录微信公众平台
2. 进入"版本管理"
3. 选择刚上传的版本，点击"提交审核"
4. 填写审核信息：
   - 功能页面: 选择主要功能页面
   - 功能描述: 详细描述小程序功能
   - 测试账号: 提供测试账号（如果需要）

#### 5.3 审核通过后发布
1. 审核通过后，在"版本管理"中点击"发布"
2. 小程序正式上线

## 🔧 运维和监控

### 1. 日志监控
```bash
# 查看PM2日志
pm2 logs zhangshang-shuati-backend

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. 性能监控
```bash
# 查看PM2状态
pm2 status
pm2 monit

# 查看系统资源
htop
df -h
```

### 3. 数据库备份
```bash
# 创建备份脚本
cat > /var/www/backup-db.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
mysqldump -u zhangshang_user -p'your_password' zhangshang_shuati > /var/backups/zhangshang_shuati_\$DATE.sql
# 保留最近7天的备份
find /var/backups -name "zhangshang_shuati_*.sql" -mtime +7 -delete
EOF

chmod +x /var/www/backup-db.sh

# 添加到定时任务
crontab -e
# 每天凌晨2点备份
0 2 * * * /var/www/backup-db.sh
```

### 4. SSL证书自动续期（Let's Encrypt）
```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d api.zhangshang-shuati.com

# 自动续期
sudo crontab -e
# 每月1号检查并续期
0 0 1 * * certbot renew --quiet
```

## 🚨 常见问题和解决方案

### 1. 小程序无法连接服务器
- 检查域名是否在微信后台配置
- 确认服务器SSL证书有效
- 检查防火墙设置

### 2. 数据库连接失败
- 检查数据库服务是否启动
- 确认数据库用户权限
- 检查网络连接

### 3. 微信登录失败
- 确认AppID和AppSecret正确
- 检查微信接口调用频率限制
- 验证服务器时间同步

### 4. 文件上传失败
- 检查上传目录权限
- 确认文件大小限制
- 检查磁盘空间

## 📞 技术支持

如果在部署过程中遇到问题，可以：
1. 查看详细的错误日志
2. 检查配置文件是否正确
3. 确认所有依赖服务正常运行
4. 联系技术支持团队

---

*部署指南版本: 1.0*
*最后更新: ${new Date().toLocaleDateString()}*