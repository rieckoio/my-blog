#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 简单的 Markdown 转 HTML 函数
function markdownToHtml(md) {
  let html = md;
  
  // 代码块
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
  });
  
  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // 标题
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // 引用块
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
  
  // 粗体
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // 斜体
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // 图片
  html = html.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  
  // 列表项
  html = html.replace(/^\s*[-*+]\s+(.*$)/gim, '<li>$1</li>');
  
  // 表格（简化处理）
  html = html.replace(/^\|(.+)\|$/gim, '<tr>$1</tr>');
  html = html.replace(/^\|?\s*:?-+:?\s*\|/gim, '');
  
  // 段落
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/^/g, '<p>');
  html = html.replace(/$/g, '</p>');
  
  // 清理多余的空段落
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<table>)/g, '$1');
  html = html.replace(/(<\/table>)<\/p>/g, '$1');
  
  return html;
}

// 提取文章元数据
function extractMetadata(content) {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : '无标题';
  
  const seriesMatch = content.match(/> \*\*系列\*\*:\s*(.+)$/m);
  const series = seriesMatch ? seriesMatch[1] : '';
  
  const difficultyMatch = content.match(/> \*\*难度\*\*:\s*(.+)$/m);
  const difficulty = difficultyMatch ? difficultyMatch[1] : '';
  
  return { title, series, difficulty };
}

// 生成文章 HTML 模板
function generateArticleHtml(content, metadata) {
  const bodyHtml = markdownToHtml(content);
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    article {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    header {
      background: #2c3e50;
      color: white;
      padding: 40px 20px;
      text-align: center;
      margin-bottom: 30px;
      border-radius: 8px;
    }
    header h1 { margin-bottom: 10px; }
    header p { opacity: 0.9; }
    .meta {
      background: #ecf0f1;
      padding: 15px 20px;
      border-radius: 6px;
      margin-bottom: 30px;
      font-size: 0.9em;
    }
    .meta span {
      margin-right: 20px;
      color: #7f8c8d;
    }
    h1 { font-size: 2em; margin-bottom: 0.5em; color: #2c3e50; }
    h2 { font-size: 1.6em; margin: 1.5em 0 0.8em; color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 0.3em; }
    h3 { font-size: 1.3em; margin: 1.2em 0 0.6em; color: #7f8c8d; }
    p { margin-bottom: 1em; }
    pre {
      background: #282c34;
      color: #abb2bf;
      padding: 20px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 1.5em 0;
    }
    code {
      background: #ecf0f1;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.9em;
      color: #e74c3c;
    }
    pre code {
      background: none;
      padding: 0;
      color: inherit;
    }
    blockquote {
      border-left: 4px solid #3498db;
      padding-left: 20px;
      margin: 1.5em 0;
      color: #7f8c8d;
      background: #f8f9fa;
      padding: 15px 20px;
      border-radius: 0 6px 6px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background: #34495e;
      color: white;
    }
    tr:nth-child(even) {
      background: #f8f9fa;
    }
    ul, ol {
      margin: 1em 0;
      padding-left: 2em;
    }
    li {
      margin-bottom: 0.5em;
    }
    a {
      color: #3498db;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .back-link {
      display: inline-block;
      margin-top: 30px;
      padding: 10px 20px;
      background: #3498db;
      color: white;
      border-radius: 6px;
      text-decoration: none;
    }
    .back-link:hover {
      background: #2980b9;
      text-decoration: none;
    }
    footer {
      text-align: center;
      padding: 30px;
      color: #999;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <header>
    <h1><a href="../index.html" style="color: white; text-decoration: none;">技术博客</a></h1>
    <p>Redis · MySQL · Elasticsearch · 分布式架构</p>
  </header>
  
  <div class="container">
    <article>
      <div class="meta">
        <span>📚 ${metadata.series}</span>
        <span>⭐ ${metadata.difficulty}</span>
        <span>📅 2026 年 3 月 17 日</span>
      </div>
      
      ${bodyHtml}
      
      <a href="../index.html" class="back-link">← 返回首页</a>
    </article>
  </div>
  
  <footer>
    <p>© 2026 技术博客。Powered by Static Blog.</p>
  </footer>
</body>
</html>`;
}

// 主函数
function build() {
  const postsDir = path.join(__dirname, 'posts');
  const mdFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  
  console.log(`找到 ${mdFiles.length} 篇 Markdown 文章`);
  
  mdFiles.forEach(file => {
    const mdPath = path.join(postsDir, file);
    const htmlFile = file.replace('.md', '.html');
    const htmlPath = path.join(postsDir, htmlFile);
    
    const content = fs.readFileSync(mdPath, 'utf-8');
    const metadata = extractMetadata(content);
    const html = generateArticleHtml(content, metadata);
    
    fs.writeFileSync(htmlPath, html, 'utf-8');
    console.log(`✓ ${file} → ${htmlFile}`);
  });
  
  console.log('\n构建完成！');
}

build();
