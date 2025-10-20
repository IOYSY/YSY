# 🚀 个人作品集主页

一个简约、酷炫、充满科技感的个人作品展示主页，支持展示视频、图片、文字描述和文档文件。

## ✨ 特性

- 🎨 **现代化设计** - 采用毛玻璃效果、渐变色彩和流畅动画
- 📱 **完全响应式** - 完美适配桌面、平板和手机设备
- 🎬 **多媒体支持** - 支持视频、图片、文档等多种格式展示
- 🌊 **流畅动画** - 精心设计的过渡动画和交互效果
- ⚡ **性能优化** - 懒加载、IntersectionObserver等优化技术
- 🎯 **易于定制** - 清晰的代码结构，方便修改和扩展

## 📂 文件结构

```
├── index.html          # 主页面文件
├── styles.css          # 样式文件
├── script.js           # JavaScript交互脚本
└── README.md          # 说明文档
```

## 🎯 快速开始

1. **直接打开**
   - 下载所有文件到同一文件夹
   - 双击打开 `index.html` 即可在浏览器中查看

2. **使用本地服务器**（推荐）
   ```bash
   # 使用Python
   python -m http.server 8000
   
   # 或使用Node.js
   npx serve
   ```
   然后在浏览器中访问 `http://localhost:8000`

## 🎨 自定义内容

### 修改个人信息

在 `index.html` 中找到以下部分并修改：

1. **导航栏logo**（第22-24行）
```html
<div class="logo-text">YSY</div>
```

2. **首页标题**（第37-39行）
```html
<span class="title-line">创造</span>
<span class="title-line">科技未来</span>
```

3. **联系方式**（第300-312行）
```html
<a href="mailto:your.email@example.com" class="contact-item">
```

### 添加/修改作品

在 `index.html` 的作品展示区域（第58行开始），可以添加新的作品卡片：

**视频作品示例：**
```html
<div class="work-card large" data-type="video">
    <div class="work-media">
        <video class="work-video" poster="封面图片.jpg" controls>
            <source src="你的视频.mp4" type="video/mp4">
        </video>
        <div class="media-overlay">
            <div class="play-icon">▶</div>
        </div>
    </div>
    <div class="work-content">
        <div class="work-tag">视频项目</div>
        <h3 class="work-title">项目标题</h3>
        <p class="work-description">项目描述...</p>
        <div class="work-meta">
            <span class="meta-item">2024</span>
            <span class="meta-item">技术标签</span>
        </div>
    </div>
</div>
```

**图片作品示例：**
```html
<div class="work-card medium" data-type="image">
    <div class="work-media">
        <img src="你的图片.jpg" alt="描述" class="work-image">
        <div class="media-overlay">
            <div class="zoom-icon">🔍</div>
        </div>
    </div>
    <div class="work-content">
        <!-- 内容同上 -->
    </div>
</div>
```

**文档作品示例：**
```html
<div class="work-card medium" data-type="document">
    <div class="work-media document-preview">
        <div class="document-icon">
            <!-- SVG图标 -->
        </div>
        <div class="document-title">文档标题</div>
    </div>
    <div class="work-content">
        <div class="work-tag">技术文档</div>
        <h3 class="work-title">文档名称</h3>
        <p class="work-description">文档描述...</p>
        <a href="你的文档.pdf" class="work-link" download>
            下载文档
        </a>
    </div>
</div>
```

### 卡片大小控制

- `work-card large` - 占据2列的大卡片
- `work-card medium` - 占据1列的中等卡片

### 修改配色方案

在 `styles.css` 的开头（第2-13行）修改CSS变量：

```css
:root {
    --primary-color: #00f0ff;      /* 主色调 */
    --secondary-color: #7000ff;    /* 次要色 */
    --accent-color: #ff006e;       /* 强调色 */
    --bg-dark: #0a0a0f;           /* 深色背景 */
    --text-primary: #ffffff;       /* 主要文字颜色 */
    --text-secondary: #b0b0c0;    /* 次要文字颜色 */
}
```

## 🖼️ 准备你的素材

### 视频文件
- 格式：MP4（推荐）
- 建议分辨率：1920x1080或1280x720
- 文件大小：建议不超过50MB（为了加载速度）
- 放置位置：与HTML文件同目录，或创建 `videos/` 文件夹

### 图片文件
- 格式：JPG或PNG
- 建议尺寸：宽度1200-2000px
- 文件大小：建议不超过2MB
- 放置位置：与HTML文件同目录，或创建 `images/` 文件夹

### 文档文件
- 格式：PDF（推荐）
- 放置位置：与HTML文件同目录，或创建 `documents/` 文件夹

### 使用示例目录结构
```
YSY_zhuye/
├── index.html
├── styles.css
├── script.js
├── README.md
├── videos/
│   ├── project1.mp4
│   └── project2.mp4
├── images/
│   ├── work1.jpg
│   ├── work2.jpg
│   └── work3.jpg
└── documents/
    ├── whitepaper.pdf
    └── design-guide.pdf
```

## 🎬 功能说明

1. **平滑滚动导航** - 点击导航栏自动滚动到对应区域
2. **视频播放控制** - 点击视频封面即可播放
3. **图片点击放大** - 点击图片可以在模态框中查看大图
4. **自定义鼠标效果** - 桌面端有跟随鼠标的光标效果
5. **滚动动画** - 滚动页面时元素逐渐出现
6. **响应式布局** - 自动适配不同屏幕尺寸

## 📱 浏览器支持

- ✅ Chrome（推荐）
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ 移动端浏览器

## 💡 使用提示

1. **性能优化建议**
   - 压缩图片和视频文件
   - 使用适当的分辨率
   - 考虑使用CDN托管大文件

2. **部署到网站**
   - 可以部署到 GitHub Pages、Netlify、Vercel等平台
   - 只需上传这些HTML、CSS、JS文件即可

3. **SEO优化**
   - 在 `<head>` 中添加meta描述
   - 为图片添加合适的alt属性
   - 添加Open Graph标签用于社交媒体分享

## 🎯 下一步

- 添加更多作品到展示区域
- 替换示例图片为你的实际作品
- 上传你的视频和文档文件
- 修改联系方式和个人信息
- 调整配色方案以匹配你的个人品牌

## 📄 许可

此项目为个人作品集模板，你可以自由使用和修改。

---

**祝你打造出精彩的个人主页！** 🎉

如有问题，请随时提问。


