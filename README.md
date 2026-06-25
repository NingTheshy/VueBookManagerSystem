# Vue Book Manager System

基于 Vue3 + Element-Plus 的图书管理系统前端项目。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **构建工具**: Vite
- **图标**: @element-plus/icons-vue

## 项目结构

```
src/
├── components/          # 公共组件
│   └── common/
│       ├── AppHeader.vue    # 顶部导航栏
│       ├── AppSidebar.vue   # 侧边栏菜单
│       └── Pagination.vue   # 分页组件
├── mock/                # Mock 数据
│   ├── books.js         # 图书数据
│   ├── borrows.js       # 借阅记录数据
│   ├── purchases.js     # 采购记录数据
│   └── users.js         # 用户数据
├── router/              # 路由配置
│   └── index.js
├── stores/              # Pinia 状态管理
│   ├── auth.js          # 认证状态
│   ├── book.js          # 图书管理
│   ├── borrow.js        # 借阅管理
│   ├── config.js        # 系统配置
│   ├── log.js           # 操作日志
│   ├── purchase.js      # 采购管理
│   └── user.js          # 用户管理
├── utils/               # 工具函数
│   ├── id.js            # ID 生成
│   ├── init.js          # 初始化
│   ├── storage.js       # 本地存储
│   └── validate.js      # 表单验证
├── views/               # 页面视图
│   ├── AdminLogin.vue       # 管理员登录
│   ├── Login.vue            # 用户登录
│   ├── Layout.vue           # 布局页面
│   ├── BookManage.vue       # 图书管理
│   ├── BookQuery.vue        # 图书查询
│   ├── BorrowHistory.vue    # 借阅历史
│   ├── BorrowInfo.vue       # 借阅信息
│   ├── PurchaseManage.vue   # 采购管理
│   ├── SystemManage.vue     # 系统管理
│   ├── UserManage.vue       # 用户管理
│   └── NotFound.vue         # 404 页面
├── App.vue              # 根组件
└── main.js              # 入口文件
```

## 功能模块

- **用户登录**: 支持普通用户和管理员登录
- **图书管理**: 图书的增删改查、分类管理
- **借阅管理**: 借阅申请、归还处理、借阅记录查询
- **采购管理**: 图书采购申请和审批
- **用户管理**: 用户信息管理、权限控制
- **系统管理**: 系统配置、操作日志

## 安装与运行

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动后访问: `http://localhost:3000`

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 开发说明

- 项目使用 Vue 3 Composition API 进行开发
- 状态管理使用 Pinia
- 路由使用 Vue Router 4
- 样式使用 Element Plus 默认样式
- Mock 数据用于本地开发和测试

## License

MIT
