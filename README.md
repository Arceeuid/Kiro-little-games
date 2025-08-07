# Vue 小游戏网站

一个基于 Vue 3 的单页面小游戏网站，提供中国象棋和国际象棋等棋类游戏。

## 功能特性

- 🎮 多种棋类小游戏
- 🏮 中国象棋游戏
- ♛ 国际象棋游戏
- 📱 响应式设计，支持移动端
- 🚀 基于 Vue 3 + Vite 构建
- 🎨 现代化 UI 设计

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **路由管理**: Vue Router 4
- **状态管理**: Pinia
- **构建工具**: Vite
- **样式**: CSS3 + CSS Modules

## 开发环境设置

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── common/         # 通用组件
│   ├── games/          # 游戏相关组件
│   └── layout/         # 布局组件
├── views/              # 页面组件
│   ├── Home.vue        # 主页
│   ├── ChineseChess.vue # 中国象棋
│   └── InternationalChess.vue # 国际象棋
├── router/             # 路由配置
├── stores/             # 状态管理
├── utils/              # 工具函数
├── assets/             # 静态资源
└── styles/             # 样式文件
```

## 开发计划

- [x] 项目初始化和基础配置
- [ ] 主页游戏展示功能
- [ ] 通用棋盘组件系统
- [ ] 中国象棋游戏逻辑和界面
- [ ] 国际象棋游戏逻辑和界面
- [ ] 状态管理和数据持久化
- [ ] UI/UX 优化和响应式设计

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

MIT License