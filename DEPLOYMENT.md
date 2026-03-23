# 博客系统部署方案

## 目录结构

```
my-blog/
├── Backend/              # FastAPI 后端
│   ├── Dockerfile
│   └── ...
├── Frontend/             # Next.js 前台
│   ├── Dockerfile
│   └── ...
├── Admin-Frontend/       # Vite + React 管理后台
│   ├── Dockerfile
│   ├── nginx.conf
│   └── ...
├── nginx/                # Nginx 配置
│   ├── nginx.conf
│   └── ssl/              # SSL 证书目录
├── mysql/                # MySQL 初始化脚本
│   └── init/
├── docker-compose.yml
├── deploy.sh             # Linux/Mac 部署脚本
├── deploy.ps1            # Windows 部署脚本
├── .env.example
└── DEPLOYMENT.md
```

## 快速部署

### Windows 用户

```powershell
# 一键部署所有服务
.\deploy.ps1 deploy

# 单独部署
.\deploy.ps1 backend    # 仅部署后端
.\deploy.ps1 frontend   # 仅部署前台
.\deploy.ps1 admin      # 仅部署管理端

# 服务管理
.\deploy.ps1 start      # 启动所有服务
.\deploy.ps1 stop       # 停止所有服务
.\deploy.ps1 restart    # 重启所有服务
```

### Linux/Mac 用户

```bash
# 添加执行权限
chmod +x deploy.sh

# 一键部署所有服务
./deploy.sh deploy

# 单独部署
./deploy.sh backend     # 仅部署后端
./deploy.sh frontend    # 仅部署前台
./deploy.sh admin       # 仅部署管理端

# 服务管理
./deploy.sh start       # 启动所有服务
./deploy.sh stop        # 停止所有服务
./deploy.sh restart     # 重启所有服务
```

## 部署方式

### 方式一：Docker Compose 部署（推荐）

#### 1. 环境准备

确保服务器已安装：
- Docker (20.10+)
- Docker Compose (2.0+)

```bash
# 检查 Docker 版本
docker --version
docker compose version
```

#### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
vim .env
```

**重要配置项：**
- `MYSQL_ROOT_PASSWORD`: MySQL root 密码
- `MYSQL_PASSWORD`: 应用数据库密码
- `JWT_SECRET_KEY`: JWT 密钥（请使用强密码）
- `CORS_ORIGINS`: 允许的跨域来源

#### 3. SSL 证书配置

```bash
# 创建 SSL 目录
mkdir -p nginx/ssl

# 方式一：使用 Let's Encrypt（推荐）
# 安装 certbot
sudo apt install certbot

# 获取证书
sudo certbot certonly --standalone -d yourdomain.com

# 复制证书
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem

# 方式二：自签名证书（仅测试用）
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

#### 4. 启动服务

```bash
# 构建并启动所有服务
docker compose up -d --build

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f
```

#### 5. 初始化数据库

```bash
# 进入后端容器执行数据库迁移
docker compose exec backend alembic upgrade head
```

#### 6. 访问服务

- 前台首页: https://localhost
- 管理后台: https://localhost/admin
- API 文档: https://localhost/docs

---

### 方式二：手动部署

#### 1. 后端部署

```bash
cd Backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
vim .env

# 数据库迁移
alembic upgrade head

# 启动服务（生产环境使用 gunicorn）
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

#### 2. 前台部署

```bash
cd Frontend

# 安装依赖
npm install

# 配置环境变量
echo "NEXT_PUBLIC_API_URL=https://yourdomain.com/api" > .env.local

# 构建
npm run build

# 启动（使用 PM2 管理）
npm install -g pm2
pm2 start npm --name "blog-frontend" -- start
```

#### 3. 管理后台部署

```bash
cd Admin-Frontend

# 安装依赖
pnpm install

# 构建
pnpm build

# 使用 Nginx 托管静态文件
sudo cp -r dist/* /var/www/blog-admin/
```

#### 4. Nginx 配置

```bash
# 复制 Nginx 配置
sudo cp nginx/nginx.conf /etc/nginx/sites-available/blog
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo nginx -s reload
```

---

## 生产环境优化

### 1. 数据库优化

```sql
-- 创建独立用户
CREATE USER 'blog'@'%' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON blog_db.* TO 'blog'@'%';
FLUSH PRIVILEGES;

-- 配置 MySQL
-- /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 500
```

### 2. 后端优化

```bash
# 使用 Gunicorn + Uvicorn
gunicorn app.main:app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  -b 0.0.0.0:8000 \
  --timeout 120 \
  --keep-alive 5 \
  --access-logfile - \
  --error-logfile -
```

### 3. 前端优化

```javascript
// next.config.mjs
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  images: {
    domains: ['your-cdn-domain.com'],
  },
};
```

### 4. Nginx 优化

```nginx
# 启用缓存
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

# 启用 Brotli 压缩
brotli on;
brotli_types text/plain text/css application/json application/javascript text/xml;
```

---

## 监控与日志

### 1. 日志管理

```bash
# 查看各服务日志
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx

# 日志轮转配置
# /etc/logrotate.d/docker-compose
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    missingok
    delaycompress
    copytruncate
}
```

### 2. 健康检查

```bash
# 后端健康检查
curl http://localhost:8000/health

# 数据库连接检查
curl http://localhost:8000/test-db
```

---

## 备份策略

### 1. 数据库备份

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mysql"
mkdir -p $BACKUP_DIR

docker compose exec -T mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} blog_db > $BACKUP_DIR/blog_db_$DATE.sql

# 保留最近 7 天的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

### 2. 定时备份

```bash
# 添加到 crontab
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /path/to/backup.sh
```

---

## 常见问题

### 1. 容器启动失败

```bash
# 查看详细日志
docker compose logs backend

# 检查容器状态
docker compose ps

# 重新构建
docker compose up -d --build --force-recreate
```

### 2. 数据库连接失败

```bash
# 检查 MySQL 容器状态
docker compose exec mysql mysql -u root -p

# 检查网络连接
docker compose exec backend ping mysql
```

### 3. SSL 证书问题

```bash
# 检查证书
openssl x509 -in nginx/ssl/cert.pem -text -noout

# 更新证书后重启 Nginx
docker compose restart nginx
```

---

## 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker compose up -d --build

# 执行数据库迁移
docker compose exec backend alembic upgrade head
```

---

## 安全建议

1. **修改默认密码**: 更改 MySQL root 密码和应用密码
2. **配置防火墙**: 只开放必要端口 (80, 443)
3. **启用 HTTPS**: 使用 Let's Encrypt 免费证书
4. **定期更新**: 保持系统和依赖包更新
5. **备份数据**: 定期备份数据库和上传文件
6. **监控日志**: 设置日志告警机制
