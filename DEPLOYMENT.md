
# 🚀 20-20-20 护眼助手 - 部署指南

本文档介绍如何将应用部署到各种服务器和平台。

## 📋 部署前准备

### 检查文件完整性
确保以下文件都存在：
```
eye-care-20-20-20/
├── index.html
├── css/style.css
├── js/
│   ├── storage.js
│   ├── timer.js
│   ├── notification.js
│   ├── ui.js
│   └── app.js
└── README.md
```

## 🌐 部署方案

### 方案 1：GitHub Pages（推荐，免费）

#### 步骤 1：创建 GitHub 仓库
```bash
cd eye-care-20-20-20

# 初始化 Git 仓库
git init

# 创建 .gitignore 文件
echo "node_modules/" > .gitignore
echo ".DS_Store" >> .gitignore

# 添加所有文件
git add .
git commit -m "Initial commit: 20-20-20 Eye Care App"

# 关联远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/eye-care-20-20-20.git
git branch -M main
git push -u origin main
```

#### 步骤 2：启用 GitHub Pages
1. 访问 GitHub 仓库页面
2. 点击 `Settings`（设置）
3. 左侧菜单选择 `Pages`
4. 在 `Source` 下选择 `main` 分支
5. 点击 `Save`（保存）
6. 等待几分钟后，访问 `https://你的用户名.github.io/eye-care-20-20-20/`

**优点：**
- ✅ 完全免费
- ✅ 支持 HTTPS
- ✅ 自动部署
- ✅ 无需服务器维护

---

### 方案 2：Vercel（推荐，免费）

#### 使用 Git 部署
1. 访问 [vercel.com](https://vercel.com)
2. 注册/登录账号
3. 点击 `New Project`
4. 导入 GitHub 仓库
5. 点击 `Deploy`
6. 完成！访问自动生成的域名

#### 使用命令行部署
```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
cd eye-care-20-20-20
vercel

# 生产环境部署
vercel --prod
```

**优点：**
- ✅ 免费额度充足
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ 支持自定义域名
- ✅ 每次 git push 自动部署

**访问地址：** `https://your-project.vercel.app`

---

### 方案 3：Netlify（免费）

#### 方法 A：拖拽部署
1. 访问 [netlify.com](https://www.netlify.com)
2. 注册/登录账号
3. 将 `eye-care-20-20-20` 文件夹拖拽到页面
4. 等待部署完成
5. 获得访问地址

#### 方法 B：Git 部署
1. 访问 [netlify.com](https://www.netlify.com)
2. 点击 `New site from Git`
3. 选择 GitHub 仓库
4. 点击 `Deploy site`

#### 方法 C：命令行部署
```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 部署
cd eye-care-20-20-20
netlify deploy

# 生产环境部署
netlify deploy --prod
```

**优点：**
- ✅ 拖拽即可部署
- ✅ 免费 HTTPS
- ✅ 全球 CDN
- ✅ 支持自定义域名

---

### 方案 4：Cloudflare Pages（免费）

#### 步骤
1. 访问 [pages.cloudflare.com](https://pages.cloudflare.com)
2. 注册/登录账号
3. 点击 `Create a project`
4. 连接 GitHub 仓库
5. 配置构建设置（静态站点无需配置）
6. 点击 `Save and Deploy`

**优点：**
- ✅ 免费无限带宽
- ✅ 全球 CDN
- ✅ 自动部署
- ✅ DDoS 防护

---

### 方案 5：自己的服务器（Nginx）

#### 步骤 1：上传文件到服务器
```bash
# 使用 SCP 上传
scp -r eye-care-20-20-20 user@your-server:/var/www/

# 或使用 rsync
rsync -avz eye-care-20-20-20/ user@your-server:/var/www/eye-care/
```

#### 步骤 2：配置 Nginx
创建配置文件 `/etc/nginx/sites-available/eye-care`：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名
    
    root /var/www/eye-care-20-20-20;
    index index.html;
    
    # 启用 Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 缓存静态资源
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 步骤 3：启用站点
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/eye-care /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

#### 步骤 4：配置 HTTPS（使用 Let's Encrypt）
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

### 方案 6：Apache 服务器

#### 步骤 1：上传文件
```bash
scp -r eye-care-20-20-20 user@your-server:/var/www/html/
```

#### 步骤 2：配置 Apache
创建配置文件 `/etc/apache2/sites-available/eye-care.conf`：

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/html/eye-care-20-20-20
    
    <Directory /var/www/html/eye-care-20-20-20>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # 启用压缩
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
    </IfModule>
    
    ErrorLog ${APACHE_LOG_DIR}/eye-care-error.log
    CustomLog ${APACHE_LOG_DIR}/eye-care-access.log combined
</VirtualHost>
```

#### 步骤 3：启用站点
```bash
# 启用站点
sudo a2ensite eye-care.conf

# 启用必要的模块
sudo a2enmod rewrite
sudo a2enmod deflate

# 重启 Apache
sudo systemctl restart apache2
```

---

### 方案 7：简单的 Node.js 服务器

创建 `server.js` 文件：

```javascript
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 静态文件服务
app.use(express.static(path.join(__dirname)));

// 所有路由返回 index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});
```

部署步骤：
```bash
# 安装依赖
npm init -y
npm install express

# 启动服务器
node server.js

# 使用 PM2 保持运行
npm install -g pm2
pm2 start server.js --name eye-care
pm2 save
pm2 startup
```

---

### 方案 8：Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM nginx:alpine

# 复制文件到 Nginx 目录
COPY . /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
```

创建 `docker-compose.yml`：

```yaml
version: '3'
services:
  eye-care:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

部署步骤：
```bash
# 构建镜像
docker build -t eye-care-app .

# 运行容器
docker run -d -p 8080:80 eye-care-app

# 或使用 docker-compose
docker-compose up -d
```

---

## 🔧 性能优化建议

### 1. 启用 Gzip 压缩
减少文件传输大小，提升加载速度。

### 2. 设置缓存头
```nginx
# Nginx 示例
location ~* \.(css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 使用 CDN
- 将静态资源托管到 CDN
- 推荐：Cloudflare、jsDelivr

### 4. 压缩资源
```bash
# 压缩 CSS
npm install -g clean-css-cli
cleancss -o style.min.css style.css

# 压缩 JS
npm install -g terser
terser app.js -o app.min.js -c -m
```

---

## 📱 PWA 支持（可选）

如果想让应用可以安装到手机/桌面，添加以下文件：

### manifest.json
```json
{
  "name": "20-20-20 护眼助手",
  "short_name": "护眼助手",
  "description": "护眼法则提醒工具",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4CAF50",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

在 `index.html` 中添加：
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#4CAF50">
```

---

## 🔒 安全建议

### 1. HTTPS
始终使用 HTTPS，保护用户数据安全。

### 2. 安全头设置
```nginx
# Nginx 配置
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### 3. CSP（内容安全策略）
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'">
```

---

## 📊 监控和分析

### Google Analytics（可选）
在 `index.html` 的 `</head>` 前添加：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🎯 快速部署对比

| 平台 | 难度 | 费用 | 速度 | 推荐度 |
|------|------|------|------|--------|
| GitHub Pages | ⭐ | 免费 | 中等 | ⭐⭐⭐⭐⭐ |
| Vercel | ⭐ | 免费 | 极快 | ⭐⭐⭐⭐⭐ |
| Netlify | ⭐ | 免费 | 极快 | ⭐⭐⭐⭐⭐ |
| Cloudflare Pages | ⭐⭐ | 免费 | 极快 | ⭐⭐⭐⭐ |
| 自建服务器 | ⭐⭐⭐⭐ | 付费 | 取决于配置 | ⭐⭐⭐ |

---

## 💡 推荐部署方案

### 个人使用
**GitHub Pages** - 简单、免费、稳定

### 团队使用
**Vercel** 或 **Netlify** - 专业、快速、易管理

### 企业使用
**自建服务器** - 完全控制、数据安全

---

## ❓ 常见问题

**Q: 部署后页面空白？**
A: 检查浏览器控制台错误，确保所有文件路径正确。

**Q: CSS/JS 文件 404？**
A: 检查文件路径是否使用相对路径，确保文件夹结构正确。

**Q: 如何绑定自定义域