# GitHub Pages 部署指南

## 方法一：自动部署（推荐）

项目已配置 GitHub Actions 自动部署。当你推送代码到 `main` 或 `master` 分支时，会自动构建并部署到 GitHub Pages。

### 设置步骤：

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "feat: 添加氮资源利用率雷达图组件"
   git push origin main
   ```

2. **启用 GitHub Pages**
   - 进入 GitHub 仓库页面
   - 点击 Settings 标签
   - 滚动到 Pages 部分
   - 在 Source 下选择 "Deploy from a branch"
   - 选择 `gh-pages` 分支
   - 点击 Save

3. **等待部署完成**
   - 前往 Actions 标签查看部署进度
   - 部署完成后，访问 `https://你的用户名.github.io/vue3-echarts-demo/`

## 方法二：手动部署

如果需要手动部署，可以使用以下命令：

```bash
# 构建并部署
npm run deploy
```

## 项目配置说明

### Vite 配置
```javascript
// vite.config.js
export default defineConfig({
  base: '/vue3-echarts-demo/', // 仓库名称
  // ... 其他配置
})
```

### 路由配置
```javascript
// src/router/index.js
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // ... 路由配置
})
```

## 部署后的访问地址

- **主页**: `https://你的用户名.github.io/vue3-echarts-demo/`
- **基础雷达图**: `https://你的用户名.github.io/vue3-echarts-demo/radar`
- **氮资源利用率雷达图**: `https://你的用户名.github.io/vue3-echarts-demo/nitrogen-utilization`
- **氮利用效率时序对比**: `https://你的用户名.github.io/vue3-echarts-demo/nitrogen-timeseries`
- **交互式氮利用效率分析**: `https://你的用户名.github.io/vue3-echarts-demo/nitrogen-interactive`

## 故障排除

### 1. 页面显示 404
- 确保 `vite.config.js` 中的 `base` 配置正确
- 确保 GitHub Pages 设置为 `gh-pages` 分支

### 2. 资源加载失败
- 检查 `base` 配置是否与仓库名一致
- 确保所有静态资源路径正确

### 3. 路由不工作
- 对于 SPA，可能需要配置 404.html 重定向
- 确保使用 `createWebHistory` 而不是 `createWebHashHistory`

### 4. 创建 404.html（可选）
如果遇到路由问题，可以在 `public` 目录下创建 `404.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <script>
    // 重定向到 index.html
    window.location.href = '/vue3-echarts-demo/';
  </script>
</head>
<body></body>
</html>
```

## 自定义域名（可选）

如果你有自定义域名：

1. 在 `public` 目录下创建 `CNAME` 文件
2. 在文件中写入你的域名，如 `example.com`
3. 在域名 DNS 设置中添加 CNAME 记录指向 `你的用户名.github.io`

## 注意事项

- 确保仓库名称与 `vite.config.js` 中的 `base` 配置一致
- 第一次部署可能需要几分钟时间
- 每次推送代码都会触发重新部署
- GitHub Pages 有流量限制，一般个人项目足够使用
