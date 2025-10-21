# 腾讯云 CloudBase 部署指南（推荐！）

## 为什么选择 CloudBase？
- ✅ 国内访问快速
- ✅ 提供临时测试域名（无需备案）
- ✅ 每月 5GB 免费流量
- ✅ 免费 SSL 证书
- ✅ 一键部署

## 部署步骤

### 1. 开通 CloudBase

1. 访问：https://console.cloud.tencent.com/tcb
2. 登录腾讯云账号（微信扫码即可）
3. 点击 "新建环境"
4. 选择 "按量计费"（免费额度够用）
5. 环境名称：`ysy-portfolio`
6. 点击创建

### 2. 安装 CloudBase CLI

在命令行运行：
```bash
npm install -g @cloudbase/cli
```

如果没有 Node.js，先安装：
https://nodejs.org/

### 3. 登录 CloudBase

```bash
cloudbase login
```
会自动打开浏览器授权

### 4. 部署网站

在你的项目目录（D:\YSY_zhuye）运行：

```bash
# 初始化
cloudbase init

# 选择：
# - 选择刚创建的环境
# - 项目类型：静态网站
# - 根目录：当前目录

# 部署
cloudbase hosting deploy ./ -e ysy-portfolio-环境ID
```

### 5. 获取访问地址

部署完成后会显示：
```
https://ysy-portfolio-xxx.tcloudbaseapp.com
```

这个域名在国内可以直接访问！

## 费用说明

免费额度（每月）：
- ✅ 存储：5GB
- ✅ 流量：5GB
- ✅ CDN：50GB

个人网站完全够用！

## 绑定自定义域名（可选）

如果以后有了备案域名：
1. CloudBase 控制台 → 静态网站托管
2. 域名管理 → 添加域名
3. 配置 DNS 解析
4. 免费申请 SSL 证书

## 更新网站

每次修改后，运行：
```bash
cloudbase hosting deploy ./ -e ysy-portfolio-环境ID
```




