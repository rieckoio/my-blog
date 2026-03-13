const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Vercel Serverless Function
module.exports = async (req, res) => {
  // 启用 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const POSTS_DIR = path.join(__dirname, '..', 'posts');
  const CONFIG_DIR = path.join(__dirname, '..', 'config');
  
  try {
    // GET /api/posts - 获取所有文章
    if (req.method === 'GET' && req.url === '/api/posts') {
      const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
      const posts = files.map(file => {
        const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const dateMatch = content.match(/^<!--\s*date:\s*(.+?)\s*-->/m);
        const slug = file.replace('.md', '');
        
        return {
          slug,
          title: titleMatch ? titleMatch[1] : slug,
          date: dateMatch ? dateMatch[1] : new Date().toISOString(),
          excerpt: content.substring(0, 200) + '...'
        };
      }).sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return res.status(200).json(posts);
    }
    
    // GET /api/posts/:slug - 获取单篇文章
    if (req.method === 'GET' && req.url.startsWith('/api/posts/')) {
      const slug = req.url.replace('/api/posts/', '').split('?')[0];
      const filePath = path.join(POSTS_DIR, `${slug}.md`);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: '文章不存在' });
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      const html = marked(content);
      
      return res.status(200).json({ slug, content, html });
    }
    
    // GET /api/config - 获取配置
    if (req.method === 'GET' && req.url === '/api/config') {
      const config = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, 'site.json'), 'utf8'));
      return res.status(200).json(config);
    }
    
    // POST /api/posts - 创建/更新文章
    if (req.method === 'POST' && req.url === '/api/posts') {
      const { slug, title, content } = req.body;
      
      if (!slug || !content) {
        return res.status(400).json({ error: '缺少必要字段' });
      }
      
      const fileSlug = slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
      const filePath = path.join(POSTS_DIR, `${fileSlug}.md`);
      
      const dateComment = `<!-- date: ${new Date().toISOString()} -->\n`;
      const titleLine = `# ${title || '无标题'}\n\n`;
      const fullContent = dateComment + titleLine + content;
      
      fs.writeFileSync(filePath, fullContent, 'utf8');
      
      return res.status(200).json({ success: true, slug: fileSlug, message: '文章已保存' });
    }
    
    // POST /api/import - 导入 Markdown
    if (req.method === 'POST' && req.url === '/api/import') {
      const { markdown, title } = req.body;
      
      if (!markdown) {
        return res.status(400).json({ error: '缺少 Markdown 内容' });
      }
      
      const slug = title 
        ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : `import-${Date.now()}`;
      
      const filePath = path.join(POSTS_DIR, `${slug}.md`);
      const dateComment = `<!-- date: ${new Date().toISOString()} -->\n`;
      const titleLine = `# ${title || '导入的文章'}\n\n`;
      
      fs.writeFileSync(filePath, dateComment + titleLine + markdown, 'utf8');
      
      return res.status(200).json({ success: true, slug, message: 'Markdown 导入成功' });
    }
    
    // DELETE /api/posts/:slug - 删除文章
    if (req.method === 'DELETE' && req.url.startsWith('/api/posts/')) {
      const slug = req.url.replace('/api/posts/', '').split('?')[0];
      const filePath = path.join(POSTS_DIR, `${slug}.md`);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: '文章不存在' });
      }
      
      fs.unlinkSync(filePath);
      return res.status(200).json({ success: true, message: '文章已删除' });
    }
    
    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
