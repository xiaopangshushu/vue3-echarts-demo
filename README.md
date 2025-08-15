# Vue3 ECharts 雷达图演示项目

🚀 一个基于 Vue 3 + ECharts 的交互式雷达图可视化项目，专注于农业数据分析和展示。

## ✨ 项目特色

- 🎯 **多维雷达图分析** - 支持多种作物和指标的对比分析
- 🎨 **美观的3D效果** - 平面/3D切换，提供更好的视觉体验
- 📊 **生长阶段分析** - 扇形雷达图展示植物生长周期数据
- 🔧 **灵活配置** - 支持动态添加指标、作物和时期
- 📱 **响应式设计** - 适配各种屏幕尺寸
- 🎭 **多种导出格式** - 支持PNG、JPG、SVG格式导出

## 🎮 在线演示

访问：[https://xiaopangshushu.github.io/vue3-echarts-demo/](https://xiaopangshushu.github.io/vue3-echarts-demo/)

## 🛠️ 技术栈

- **Vue 3** - 组合式API + 响应式系统
- **ECharts** - 数据可视化图表库
- **Element Plus** - UI组件库
- **Vue Router** - 单页面应用路由
- **Vite** - 构建工具
- **SCSS** - CSS预处理器

## 📁 项目结构

```
src/
├── views/
│   ├── HomeView.vue           # 首页
│   ├── IntegratedRadarDashboard.vue  # 综合雷达图仪表板
│   └── GrowthStageRadar.vue   # 生长阶段雷达图
├── components/
│   └── Charts2.vue            # 图表组件
├── router/
│   └── index.js               # 路由配置
└── assets/                    # 静态资源
```

## 🚀 快速开始

### 环境要求

- Node.js >= 20.19.0 或 >= 22.12.0
- npm 或 yarn

### 安装依赖

```sh
npm install
```

### 开发模式

```sh
npm run dev
```

访问 `http://localhost:5173` 查看项目

### 构建生产版本

```sh
npm run build
```

### 部署到GitHub Pages

```sh
npm run deploy
```

## 📈 功能模块

### 1. 综合雷达图仪表板
- 支持多标签页管理
- 动态数据编辑
- 实时图表更新
- 统计分析面板

### 2. 生长阶段分析
- 扇形雷达图展示
- 生长周期数据
- 趋势分析统计

### 3. 3D效果切换
- 平面/3D视觉切换
- 阴影和渐变效果
- 增强视觉层次感

## 🎯 使用指南

1. **添加新的雷达图**: 点击"新增"按钮创建新的分析标签页
2. **编辑配置**: 使用"编辑配置"按钮添加指标、作物和时期
3. **数据编辑**: 直接在表格中修改数值，图表会实时更新
4. **3D效果**: 切换3D开关体验不同的视觉效果
5. **导出图表**: 选择格式导出当前或所有图表

## 🔧 配置说明

项目使用 Vite 构建，主要配置项：

- `base: '/vue3-echarts-demo/'` - GitHub Pages 部署路径
- 支持 SCSS 预处理器
- 配置了路径别名 `@` 指向 `src` 目录

## 📝 开发说明

### 添加新图表类型

1. 在对应的 Vue 组件中添加新的 ECharts 配置
2. 更新响应式数据和计算属性
3. 添加相应的UI控制元素

### 自定义主题

项目使用 SCSS，可以在 `src/assets/scss/main.scss` 中自定义样式变量。

## 🤝 贡献指南

1. Fork 这个仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

这个项目使用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [ECharts](https://echarts.apache.org/) - 强大的数据可视化库
- [Element Plus](https://element-plus.org/) - Vue 3 UI组件库
