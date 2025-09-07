# 一键部署极简指南（小白版）

你只需要会复制粘贴。下面所有操作在你云服务器的 SSH 里执行。

## 1. 登录服务器
服务商控制台里用“远程连接”或本地终端：
```
ssh root@你的服务器公网IP
```

## 2. 下载并执行一键脚本
把仓库代码拉到本地后，复制 `scripts/oneclick-prod.sh` 到服务器，或者直接：
```
curl -O https://<你的raw文件地址>/scripts/oneclick-prod.sh
bash oneclick-prod.sh
```
脚本会：
1. 安装 Docker & Compose
2. 克隆代码（或更新）
3. 生成 `.env.production`（自动生成强密码 + JWT）
4. 启动全部容器

## 3. 查看运行情况
```
docker compose ps
docker compose logs -f backend
```

健康检查：
```
curl http://服务器IP:3000/api/v1/health
```
返回 `OK` 就成功。

## 4. 绑定域名 (可选)
到你的域名服务商把下面解析到服务器公网IP：
```
api.你的域名
admin.你的域名
h5.你的域名
```
然后在 `nginx/conf.d/` 里新增 3 个 *.conf（参考主 README 高级版），重启：
```
docker compose restart nginx
```

## 5. HTTPS (以后再做)
等域名生效后再申请证书放到 `nginx/ssl/`，再修改 conf。

## 6. 重要文件
```
.env.production      # 环境变量
docker-compose.production.yml
scripts/oneclick-prod.sh
```

## 7. 常用命令
```
# 查看容器状态
docker compose ps
# 持续看后端日志
docker compose logs -f backend
# 重启后端
docker compose restart backend
# 更新代码并重建
git pull && docker compose up -d --build backend
```

## 8. 备份（简单手动法）
```
docker exec zhangshang-shuati-mysql sh -c 'mysqldump -uappuser -p"$MYSQL_PASSWORD" shuati_prod' > backup.sql
```

## 9. 如果失败
拷贝这条输出给我：
```
docker compose logs --tail=200 backend
```

## 10. 不要做的事
- 不要把 `.env.production` 发给任何人
- 不要随便 `docker system prune -a`（会删镜像）

完。
