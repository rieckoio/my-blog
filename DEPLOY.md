# 博客公网访问方案

## 方案对比

| 方案 | 优点 | 缺点 | 适合场景 |
|------|------|------|----------|
| **Vercel** | 免费、稳定、自动 HTTPS、全球 CDN | 需要 GitHub 账号，数据存储需配置 | 长期稳定使用 |
| **Netlify** | 免费、拖拽部署、表单支持 | 动态功能有限 | 静态博客 |
| **Cloudflare Pages** | 免费、速度快、不限流量 | 需要配置 | 全球访问 |
| **localtunnel** | 无需注册、即时可用 | URL 每次变化、有安全提醒页 | 临时测试 |

## 推荐：Vercel 部署步骤

### 前提条件
- GitHub 账号（免费）

### 步骤

**1. 将代码推送到 GitHub**
```bash
cd /home/admin/openclaw/workspace/blog
git init
git add .
git commit -m "Initial blog"
# 然后在 GitHub 创建新仓库，按提示推送
```

**2. 部署到 Vercel**
- 访问 https://vercel.com/new
- 点击 "Import Git Repository"
- 选择你的博客仓库
- 点击 "Deploy"

**3. 完成**
- 获得 `https://your-blog.vercel.app` 域名
- 全球可访问，无需隧道

## 临时方案：继续使用隧道

当前可用隧道：
- URL: https://wise-tigers-see.loca.lt
- 密码：8.139.243.171

**注意**：每次重启隧道 URL 会变化

## 数据存储说明

当前版本使用本地文件系统存储文章。部署到云端后，文章数据需要：
- 方案 A：使用 Vercel KV (Redis) - 免费额度足够
- 方案 B：使用 MongoDB Atlas - 免费 512MB
- 方案 C：使用 GitHub API 存储 - 完全免费

需要我帮你配置哪个方案？
