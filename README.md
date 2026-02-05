# 合同管理系统

基于 React 前端 + Python FastAPI 后端 + PostgreSQL 的合同管理系统，支持三级权限（超级管理员 / 财务 / 普通账号）、合同 CRUD、附件上传与下载，使用 Docker Compose 一键启动。

## 功能

- **权限**：超级管理员可操作全部合同与用户管理；财务仅可查看全部合同；普通账号仅可操作自己创建的合同。
- **合同**：合同列表（分页、关键词/状态/日期筛选）、详情、新建、编辑、删除；附件上传与下载。
- **用户管理**：仅超级管理员可创建/编辑/删除用户，分配角色。

## 快速启动（Docker Compose）

1. 确保已安装 Docker 与 Docker Compose。

2. **配置 SSL 证书（HTTPS 必需）**

   **开发/测试环境**（使用自签名证书）：
   ```bash
   ./scripts/generate-self-signed-cert.sh
   ```

   **生产环境**（使用 Let's Encrypt 证书）：
   - 详见 `ssl/README.md`
   - 需要域名已解析到服务器 IP
   - 使用 certbot 获取证书后，将证书复制到 `ssl/` 目录

3. 在项目根目录执行：

```bash
docker-compose up -d
```

4. 等待服务就绪（约 30 秒），访问：
   - **HTTPS**: https://localhost（或你的域名）
   - **HTTP**: http://localhost（会自动重定向到 HTTPS）
   
5. 默认超级管理员账号：**admin** / **admin123**（首次启动会自动创建）。

**注意**：使用自签名证书时，浏览器会显示安全警告，需要手动信任（点击"高级" -> "继续访问"）。生产环境请使用 Let's Encrypt 证书。

## 本地开发

### 后端

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

配置环境变量（或复制 `.env.example` 为 `.env` 并修改）：

- `DATABASE_URL`：PostgreSQL 连接串，例如 `postgresql://postgres:postgres@localhost:5432/hetong`
- `JWT_SECRET`：JWT 密钥
- `UPLOAD_DIR`：上传目录，默认 `uploads`

启动数据库（若未用 Docker）：

```bash
# 例如用 Docker 仅起 PG
docker run -d --name pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hetong -p 5432:5432 postgres:15-alpine
```

执行迁移并创建管理员：

```bash
alembic upgrade head
python scripts/seed_admin.py
```

启动 API：

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 前端

```bash
cd frontend
pnpm install
pnpm dev
```

浏览器访问 http://localhost:3000，开发环境下 Vite 会将 `/api` 代理到后端（见 `vite.config.js`）。

## 自测用例（简要）

| # | 场景 | 预期 |
|---|------|------|
| 1 | 超级管理员 admin 登录 | 成功，可进合同与用户管理 |
| 2 | 财务账号登录 | 合同仅查看，无新建/编辑/删除，无用户管理入口 |
| 3 | 普通用户创建合同 | 成功，仅能看自己的合同 |
| 4 | 普通用户 B 尝试访问 A 的合同 | 列表不展示，直接访问详情返回 403 |
| 5 | 普通用户编辑/删除自己的合同 | 成功 |
| 6 | 普通用户尝试编辑他人合同 | 403 |
| 7 | 管理员删除任意合同 | 成功 |
| 8 | 上传附件后下载 | 文件正确下载 |
| 9 | 管理员创建财务账号并登录 | 该账号仅能查看合同 |
| 10 | 未登录访问 /contracts | 401，跳转登录页 |

## HTTPS 配置

项目已配置支持 HTTPS，默认使用 443 端口。

### SSL 证书配置

- **开发/测试环境**：使用自签名证书（运行 `./scripts/generate-self-signed-cert.sh`）
- **生产环境**：推荐使用 Let's Encrypt 免费证书（详见 `ssl/README.md`）

证书文件应放置在 `ssl/` 目录：
- `ssl/cert.pem` - SSL 证书文件
- `ssl/key.pem` - SSL 私钥文件

### Nginx 配置

- HTTP (80端口) 自动重定向到 HTTPS
- HTTPS (443端口) 提供应用服务
- 已配置安全头（HSTS、X-Frame-Options 等）
- 支持 Let's Encrypt 证书验证路径（`/.well-known/acme-challenge/`）

## 项目结构

- `backend/`：FastAPI 应用、模型、API、存储抽象与本地实现、Alembic 迁移。
- `frontend/`：Vite + React、路由、合同/用户页面、API 封装。
- `docker-compose.yml`：postgres、backend、frontend（nginx）编排。
- `ssl/`：SSL 证书目录（需自行配置）。
- `scripts/`：部署脚本（如生成自签名证书）。

文件上传当前为本地磁盘存储，接口已抽象，后续可替换为 OSS 实现。
