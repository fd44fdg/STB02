#!/bin/bash
# 一键生产部署脚本（给小白）
# 适用：全新 Linux 服务器（CentOS / Alibaba Cloud Linux / Ubuntu 均可）
# 作用：安装 Docker、克隆代码(如果已存在则跳过)、生成 .env.production 模板、启动服务。
# 使用方式：
#   1) 把本脚本上传到服务器 /root 或任意目录
#   2) 修改变量 REPO_URL DOMAIN_BASE 后执行: bash oneclick-prod.sh
#   3) 结束后访问: http(s)://api.<你的域名>/api/v1/health

set -e

REPO_URL="<请填你的Git仓库地址>"
PROJECT_DIR="/opt/shuati"
DOMAIN_BASE="example.com"   # 根域名，下面会生成子域

# --- 0. 基础检查 ---
echo "[0] 开始一键部署"
if [ "$(id -u)" != "0" ]; then
  echo "请用 root 运行 (sudo -i)"; exit 1; fi

# --- 1. 安装 Docker ---
if ! command -v docker >/dev/null 2>&1; then
  echo "[1] 安装 Docker..."
  curl -fsSL https://get.docker.com | bash
  systemctl enable --now docker
else
  echo "[1] Docker 已存在，跳过"
fi

# 安装 compose 插件
if ! docker compose version >/dev/null 2>&1; then
  echo "[1] 安装 Docker Compose 插件..."
  mkdir -p /usr/local/lib/docker/cli-plugins
  curl -SL https://github.com/docker/compose/releases/download/v2.29.2/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi

# --- 2. 代码获取 ---
if [ ! -d "$PROJECT_DIR" ]; then
  echo "[2] 克隆仓库..."
  git clone "$REPO_URL" "$PROJECT_DIR"
else
  echo "[2] 仓库已存在，执行 git pull"
  cd "$PROJECT_DIR" && git pull
fi
cd "$PROJECT_DIR"

# --- 3. 生成 .env.production （若不存在）---
if [ -f .env.production ]; then
  echo "[3] .env.production 已存在，跳过生成"
else
  echo "[3] 生成 .env.production 模板"
  RAND_JWT=$(openssl rand -base64 48 | tr -d '\n')
  RAND_DB_PASS=$(openssl rand -base64 18 | tr -d '\n' | tr '/+' 'Aa')
  cat > .env.production <<EOF
PORT=3000
ADMIN_PORT=8080
MOBILE_PORT=8081
PMA_PORT=8082

DB_HOST=db
DB_PORT=3306
DB_NAME=shuati_prod
DB_USER=appuser
DB_PASSWORD=${RAND_DB_PASS}

JWT_SECRET=${RAND_JWT}
JWT_EXPIRES_IN=24h

CORS_ORIGINS=https://api.${DOMAIN_BASE},https://admin.${DOMAIN_BASE},https://h5.${DOMAIN_BASE}

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=80

USE_SQLITE=false
EOF
fi

echo "[3] 当前 .env.production 内容（敏感字段已隐藏部分）："
grep -v JWT_SECRET .env.production
echo "JWT_SECRET=*** 已生成 (长度: $(grep JWT_SECRET .env.production | awk -F= '{print length($2)}'))"

# --- 4. 启动服务 ---
echo "[4] 拉起容器 (production compose)"
docker compose -f docker-compose.production.yml --env-file .env.production up -d --build

echo "[4] 等待后端健康检查..."
sleep 8
if curl -fs http://localhost:3000/api/v1/health >/dev/null 2>&1; then
  echo "[OK] 后端健康接口已就绪"
else
  echo "[警告] 后端暂未通过健康检查，稍后请查看日志： docker compose logs backend"
fi

echo "---------------- 部署完成 ----------------"
echo "后端:   http://api.${DOMAIN_BASE}  (需要先在 nginx/conf.d 新增域名并配置 DNS)"
echo "管理后台: http://admin.${DOMAIN_BASE}"
echo "H5:     http://h5.${DOMAIN_BASE}"
echo "本机测试 API: curl http://服务器IP:3000/api/v1/health"
echo "查看日志: docker compose logs -f backend"
echo "------------------------------------------"
