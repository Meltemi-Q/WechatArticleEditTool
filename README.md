# 微信公众号文章排版工具

一个专为微信公众号文章设计的在线排版工具，提供富文本编辑、样式管理、图片处理和实时预览等功能。

## ✨ 功能特性

### 🎨 富文本编辑
- 基于 Quill.js 的强大编辑器
- 支持 Markdown 语法
- 实时预览功能
- 撤销重做操作

### 🖼️ 智能图片处理
- 拖拽上传图片
- 自动优化尺寸（适配微信677px宽度）
- 智能压缩算法
- 图片对齐和说明功能

### 🎯 样式管理
- 预设标题样式模板
- 自定义颜色主题
- 一键应用专业排版
- 微信风格样式

### 📚 专题管理
- 组织历史文章
- 生成系列专题模板
- 标签分类管理
- 批量操作功能

### 📱 实时预览
- 微信公众号样式预览
- 手机端显示效果
- 实时内容同步
- 导出HTML源码

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI框架**: Tailwind CSS 4.x
- **富文本编辑**: Quill.js + react-quill
- **状态管理**: Zustand
- **本地存储**: Dexie.js (IndexedDB)
- **图标库**: Lucide React
- **图片处理**: Canvas API

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/your-username/wechat-article-tool.git

# 进入项目目录
cd wechat-article-tool

# 安装依赖
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173` 即可使用。

### 构建生产版本

```bash
npm run build
```

构建后的文件将在 `dist` 目录中。

## 📖 使用说明

### 1. 编辑文章
1. 在左侧边栏输入文章标题和作者信息
2. 可选择上传封面图片
3. 在中间编辑器区域编写文章内容
4. 支持富文本格式和Markdown语法

### 2. 样式设置
1. 点击左侧导航的"样式设置"
2. 选择预设的标题样式模板
3. 自定义颜色主题
4. 实时查看右侧预览效果

### 3. 图片处理
1. 在编辑器中插入图片或拖拽上传
2. 使用右侧图片工具调整尺寸和对齐
3. 添加图片说明文字
4. 自动优化为微信最佳显示效果

### 4. 导出内容
1. 点击"复制到剪贴板"直接粘贴到微信后台
2. 查看HTML源码进行高级自定义
3. 保存为草稿文件便于后续编辑

### 5. 专题管理
1. 点击"专题管理"创建文章专题
2. 组织相关文章形成系列
3. 添加标签分类
4. 生成专题模板

## 🎯 项目特色

### 💰 完全免费
- 无需服务器部署成本
- 纯前端架构设计
- 基于免费开源技术栈

### 🔒 数据安全
- 所有数据本地存储
- 不上传到任何服务器
- 支持离线使用

### 📱 响应式设计
- 适配桌面和移动设备
- 优化的触摸交互
- 灵活的布局系统

### ⚡ 性能优化
- 快速启动和加载
- 高效的图片处理
- 流畅的编辑体验

## 🗂️ 项目结构

```
wechat-article-tool/
├── public/                 # 静态资源
├── src/
│   ├── components/         # React组件
│   │   ├── Editor/        # 编辑器组件
│   │   ├── ImageProcessor/ # 图片处理组件
│   │   ├── Layout/        # 布局组件
│   │   ├── StyleManager/  # 样式管理组件
│   │   └── TopicManager/  # 专题管理组件
│   ├── stores/            # Zustand状态管理
│   ├── utils/             # 工具函数
│   ├── types/             # TypeScript类型定义
│   └── styles/            # 样式文件
├── package.json
├── tailwind.config.js     # Tailwind配置
├── tsconfig.json          # TypeScript配置
└── vite.config.ts         # Vite配置
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目！

### 开发流程
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 配置
- 组件采用函数式编程和 Hooks
- 添加适当的注释和文档

## 📝 更新日志

### v1.0.0 (2024-01-20)
- ✨ 完整的富文本编辑功能
- 🎨 样式模板和主题系统
- 🖼️ 图片处理和优化
- 📱 微信预览和导出
- 📚 专题管理功能
- 🔧 响应式设计支持

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

感谢以下开源项目的支持：
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Quill.js](https://quilljs.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Lucide React](https://lucide.dev/)

---

<p align="center">
  Made with ❤️ for 微信公众号作者
</p>
