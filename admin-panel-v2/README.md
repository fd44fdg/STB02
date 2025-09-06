# Admin Panel v2

现代化的管理后台（Vue3 + Vite + Pinia + Naive UI），采用“玻璃质感（Glassmorphism）”设计，逐步替换现有 v1 管理后台。

## 本地运行

1. 确保后端已启动在 http://localhost:3000 且允许 CORS（或使用 vite 代理）
2. 安装依赖并启动：

```bash
cd admin-panel-v2
npm install
npm run dev
```

访问 http://localhost:8090

默认登录：admin / admin123

## API 代理

vite.config.js 中已配置：

```js
server: {
  port: 8090,
  proxy: {
    '/api/v1': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

## 页面

- 登录
- 仪表盘
- 轮播图管理（Banners v2）
  - 列表/搜索/状态切换/新增/编辑/删除
  - 待办：图片上传、拖拽排序、批量操作

## 设计系统

- 全局背景：径向渐变 + 深色底
- 玻璃面板：backdrop-filter: blur(16px) + 透明边 + 阴影
- 主题色：#5AC8FA（可在 App.vue themeOverrides 调整）

## 下一步

- 上传接口：POST /api/v1/upload/banners（表单字段 file）
- 前端 UploadImage 组件，Banner 表单支持选择上传或填写 URL
- 拖拽排序：前端 Draggable + 后端批量提交接口
- 权限与菜单：基于角色的菜单渲染与路由守卫

