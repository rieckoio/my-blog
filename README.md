# 博客部署指南

## 本地运行

```bash
cd blog
npm install
npm start
```

访问：http://localhost:3000

## 部署到 Vercel（推荐）

### 方法 1：Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署
cd blog
vercel --prod
```

### 方法 2：GitHub 自动部署

1. 将 blog 文件夹推送到 GitHub 仓库
2. 在 Vercel 官网导入该仓库
3. 自动部署完成

### 方法 3：直接上传

访问 https://vercel.com/new 上传项目

## 部署后

- Vercel 会自动分配一个 `.vercel.app` 域名
- 支持自定义域名
- 免费 HTTPS
- 全球 CDN 加速

## 注意事项

Vercel 是无服务器环境，文章数据存储在：
- 开发环境：本地 `posts/` 目录
- 生产环境：需要使用数据库或 Vercel Blob Storage

如需持久化存储，建议：
1. 使用 Vercel KV (Redis)
2. 使用 MongoDB Atlas
3. 使用 GitHub API 存储文章
