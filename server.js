const express = require('express');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const POSTS_DIR = path.join(__dirname, 'posts');
const CONFIG_DIR = path.join(__dirname, 'config');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 确保目录存在
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}

// 获取所有文章
app.get('/api/posts', (req, res) => {
  try {
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
    
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取单篇文章
app.get('/api/posts/:slug', (req, res) => {
  try {
    const filePath = path.join(POSTS_DIR, `${req.params.slug}.md`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const html = marked(content);
    
    res.json({
      slug: req.params.slug,
      content,
      html
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 创建/更新文章
app.post('/api/posts', (req, res) => {
  try {
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
    
    res.json({
      success: true,
      slug: fileSlug,
      message: '文章已保存'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除文章
app.delete('/api/posts/:slug', (req, res) => {
  try {
    const filePath = path.join(POSTS_DIR, `${req.params.slug}.md`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    fs.unlinkSync(filePath);
    res.json({ success: true, message: '文章已删除' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Markdown 导入
app.post('/api/import', (req, res) => {
  try {
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
    
    res.json({
      success: true,
      slug,
      message: 'Markdown 导入成功'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取站点配置
app.get('/api/config', (req, res) => {
  try {
    const configPath = path.join(CONFIG_DIR, 'site.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`博客服务器运行在 http://localhost:${PORT}`);
  console.log(`管理入口：http://localhost:${PORT}/admin`);
});
