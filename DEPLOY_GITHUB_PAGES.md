# 静态博客部署指南

## 本地预览

```bash
# 安装依赖
npm install

# 构建静态文件
npm run build

# 本地预览（需要安装 http-server）
npx http-server public -p 3000
```

访问：http://localhost:3000

## 部署到 GitHub Pages

### 方法 1：使用 GitHub Actions（推荐，自动部署）

1. 推送代码到 GitHub（已完成）
2. 在仓库设置中启用 GitHub Pages
3. 每次推送会自动构建和部署

### 方法 2：手动部署

```bash
# 1. 构建静态文件
npm run build

# 2. 切换到 gh-pages 分支
git checkout --orphan gh-pages

# 3. 只保留 public 目录内容
git rm -rf .
git checkout main -- public
git mv public/* ./
git rmdir public

# 4. 提交并推送
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

### 启用 GitHub Pages

1. 访问仓库：https://github.com/rieckoio/my-blog/settings/pages
2. **Source** 选择 `Deploy from a branch`
3. **Branch** 选择 `gh-pages`，文件夹选择 `/ (root)`
4. 点击 **Save**
5. 等待几分钟后，访问 `https://rieckoio.github.io/my-blog/`

## 发布新文章

1. 在 `posts/` 目录创建新的 Markdown 文件
2. 运行 `npm run build` 生成静态页面
3. 提交并推送到 GitHub
4. GitHub Pages 会自动更新

## 自定义域名（可选）

1. 在仓库设置 → Pages → Custom domain 添加域名
2. 在域名 DNS 添加 CNAME 记录指向 `rieckoio.github.io`

## 文件结构

```
blog/
├── posts/              # Markdown 文章源文件
│   └── welcome.md
├── public/             # 生成的静态文件（自动构建）
│   ├── index.html
│   └── welcome.html
├── build.js            # 构建脚本
├── package.json
└── README.md
```
