# GitHub Pages 部署指南

## 🚀 快速部署步骤

### 第一步：推送代码到GitHub
```bash
# 1. 添加所有文件到暂存区
git add .

# 2. 提交更改
git commit -m "feat: 完善径向分析功能和下载功能"

# 3. 推送到GitHub
git push origin main
```

### 第二步：在GitHub上配置Pages

1. **进入仓库设置**
   - 打开你的GitHub仓库页面
   - 点击仓库名称下方的 **"Settings"** 标签
   - 在左侧菜单中找到并点击 **"Pages"**

2. **配置GitHub Pages**
   - 在 "Source" 部分，选择 **"GitHub Actions"**
   - ⚠️ **重要**: 不要选择 "Deploy from a branch"
   - 选择后页面会显示 "GitHub Actions" 已启用

3. **保存配置**
   - 配置会自动保存
   - 不需要手动点击任何保存按钮

### 第三步：等待部署完成

1. **查看部署状态**
   - 点击仓库顶部的 **"Actions"** 标签
   - 你会看到一个正在运行的工作流 "Deploy to GitHub Pages"
   - ⚠️ **如果没有看到Actions运行**：
     - 确保GitHub Pages设置为 "GitHub Actions"
     - 检查 `.github/workflows/deploy.yml` 文件是否存在
     - 推送代码后等待几分钟
   - 等待状态变为绿色的 ✅

2. **获取网站链接**
   - 部署成功后，回到 **Settings > Pages**
   - 页面顶部会显示: "Your site is published at https://xiaopangshushu.github.io/vue3-echarts-demo/"
   - 点击链接即可访问你的网站

## 📋 详细截图说明

### GitHub仓库界面
```
[仓库名称] vue3-echarts-demo
< > Code  📊 Issues  🔄 Pull requests  ⚙️ Settings
```

### Settings页面左侧菜单
```
General
Access
Code and automation
├─ Actions
├─ Secrets and variables  
├─ Pages           👈 点击这里
├─ Environments
└─ ...
```

### Pages配置页面
```
GitHub Pages

Source
● GitHub Actions          👈 选择这个
○ Deploy from a branch

GitHub Actions
GitHub Actions enables you to build and deploy from any branch or commit.
```

## 🔍 故障排除

### 如果没有看到Actions运行
1. **检查GitHub Pages设置**：
   - 进入 Settings > Pages
   - 确保Source选择的是 "GitHub Actions" 而不是 "Deploy from a branch"
   
2. **检查工作流文件**：
   - 确保 `.github/workflows/deploy.yml` 文件存在
   - 文件内容应该包含正确的权限设置

3. **手动触发部署**：
   - 在Actions页面，点击工作流名称
   - 点击 "Run workflow" 按钮

### 如果部署失败
1. 检查 Actions 页面的错误信息
2. 确保 package.json 中的 build 脚本正常
3. 检查 vite.config.js 中的 base 路径设置

### 如果网站无法访问
1. 等待5-10分钟，GitHub Pages需要时间生效
2. 检查浏览器缓存，尝试清除缓存或使用无痕模式
3. 确认链接格式: https://用户名.github.io/仓库名/

## ✅ 成功标志

当你看到以下内容时，说明部署成功：
- Actions页面显示绿色 ✅ 
- Settings > Pages 显示 "Your site is published at..."
- 可以正常访问网站链接

## 🎯 访问地址
部署成功后，你的网站将在以下地址可用：
**https://xiaopangshushu.github.io/vue3-echarts-demo/**
