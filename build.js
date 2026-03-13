const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const POSTS_DIR = path.join(__dirname, 'posts');
const PUBLIC_DIR = path.join(__dirname, 'public');
const CONFIG_PATH = path.join(__dirname, 'config', 'site.json');

// 读取配置
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

// 读取所有文章
function getPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  return files.map(file => {
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const dateMatch = content.match(/^<!--\s*date:\s*(.+?)\s*-->/m);
    const slug = file.replace('.md', '');
    
    return {
      slug,
      title: titleMatch ? titleMatch[1] : slug,
      date: dateMatch ? dateMatch[1] : new Date().toISOString(),
      excerpt: content.substring(0, 200) + '...',
      content
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// 生成首页
function generateIndex(posts) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.siteTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }
    .container { max-width: 900px; margin: 0 auto; padding: 20px; }
    header {
      background: #2c3e50;
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    header h1 { margin-bottom: 10px; }
    header p { opacity: 0.9; }
    .post-list { margin-top: 30px; }
    .post-card {
      background: white;
      padding: 25px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    .post-card:hover { transform: translateY(-3px); }
    .post-card h2 { margin-bottom: 10px; }
    .post-card h2 a { color: #2c3e50; text-decoration: none; }
    .post-card h2 a:hover { color: #3498db; }
    .post-date { color: #999; font-size: 0.9em; margin-bottom: 15px; }
    .post-excerpt { color: #666; }
    footer { text-align: center; padding: 30px; color: #999; margin-top: 40px; }
    .read-more {
      display: inline-block;
      margin-top: 15px;
      color: #3498db;
      text-decoration: none;
    }
    .read-more:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <header>
    <h1>${config.siteTitle}</h1>
    <p>${config.siteDescription}</p>
  </header>
  
  <div class="container">
    <div class="post-list">
      ${posts.map(post => `
        <div class="post-card">
          <h2><a href="/${post.slug}.html">${post.title}</a></h2>
          <div class="post-date">${new Date(post.date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</div>
          <div class="post-excerpt">${post.excerpt}</div>
          <a href="/${post.slug}.html" class="read-more">阅读全文 →</a>
        </div>
      `).join('')}
    </div>
  </div>
  
  <footer>
    <p>© ${new Date().getFullYear()} ${config.author}. Powered by Static Blog.</p>
  </footer>
</body>
</html>`;
}

// 生成文章页面
function generatePost(post) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} - ${config.siteTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.8;
      color: #333;
      background: #f5f5f5;
    }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .back-link {
      display: inline-block;
      margin: 20px 0;
      color: #3498db;
      text-decoration: none;
    }
    .back-link:hover { text-decoration: underline; }
    .article {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .article h1 { margin-bottom: 20px; color: #2c3e50; }
    .article-date { color: #999; margin-bottom: 30px; font-size: 0.9em; }
    .article-content { line-height: 1.8; }
    .article-content img { max-width: 100%; height: auto; }
    .article-content pre {
      background: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      margin: 15px 0;
    }
    .article-content code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    .article-content blockquote {
      border-left: 4px solid #3498db;
      padding-left: 20px;
      margin: 20px 0;
      color: #666;
    }
    .article-content h1, .article-content h2, .article-content h3 {
      margin: 30px 0 15px;
      color: #2c3e50;
    }
    .article-content ul, .article-content ol {
      margin: 15px 0;
      padding-left: 30px;
    }
    .article-content li { margin: 8px 0; }
    footer { text-align: center; padding: 30px; color: #999; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <a href="/index.html" class="back-link">← 返回首页</a>
    <div class="article">
      <h1>${post.title}</h1>
      <div class="article-date">${new Date(post.date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</div>
      <div class="article-content">${marked(post.content)}</div>
    </div>
  </div>
  <footer>
    <p>© ${new Date().getFullYear()} ${config.author}. Powered by Static Blog.</p>
  </footer>
</body>
</html>`;
}

// 生成所有页面
function build() {
  console.log('🔨 开始构建静态博客...');
  
  const posts = getPosts();
  console.log(`📄 找到 ${posts.length} 篇文章`);
  
  // 生成首页
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  fs.writeFileSync(indexPath, generateIndex(posts), 'utf8');
  console.log('✅ 生成首页');
  
  // 生成文章页面
  posts.forEach(post => {
    const postPath = path.join(PUBLIC_DIR, `${post.slug}.html`);
    fs.writeFileSync(postPath, generatePost(post), 'utf8');
    console.log(`✅ 生成文章：${post.slug}.html`);
  });
  
  console.log('🎉 构建完成！');
  console.log(`📂 输出目录：${PUBLIC_DIR}`);
}

build();
