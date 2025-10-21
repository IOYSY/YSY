# Cloudflare Pages 部署指南

## 为什么选择 Cloudflare Pages？
- ✅ 比 Vercel 在国内访问更稳定
- ✅ 免费 CDN + SSL
- ✅ 无需备案
- ✅ 可以绑定自定义域名（未备案域名也可以，但国内访问慢）

## 部署步骤

### 1. 准备 Git 仓库

在项目目录运行：
```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. 推送到 GitHub

1. 在 GitHub 创建新仓库（公开或私有都可以）
2. 运行：
```bash
git remote add origin https://github.com/你的用户名/ysy-portfolio.git
git branch -M main
git push -u origin main
```

### 3. 部署到 Cloudflare Pages

1. 访问：https://pages.cloudflare.com/
2. 用 GitHub 账号登录
3. 点击 "Create a project"
4. 选择你的仓库：`ysy-portfolio`
5. 配置：
   - **Project name**: ysy-portfolio
   - **Production branch**: main
   - **Build command**: (留空)
   - **Build output directory**: /
6. 点击 "Save and Deploy"

### 4. 获取访问地址

部署完成后会得到：
```
https://ysy-portfolio.pages.dev
```

## 国内访问优化

### 方法1：使用 Cloudflare 中国网络（推荐）

如果有未备案的国际域名：
1. 将域名 NS 改为 Cloudflare
2. 启用 Cloudflare 中国网络（付费功能，$200/月）

### 方法2：使用免费 CDN 加速

使用国内免费 CDN 代理 Cloudflare Pages：
- 七牛云 CDN（每月10GB免费）
- 又拍云（需认证）

## 国内访问测试

部署后，从国内访问测试：
- 如果能正常打开 → ✅ 使用
- 如果很慢或打不开 → 需要备案域名或其他方案




