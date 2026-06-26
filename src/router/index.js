import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  // ==================== 前端用户端 ====================
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '读者登录', guest: true }
  },
  {
    path: '/book-query',
    name: 'BookQuery',
    component: () => import('@/views/BookQuery.vue'),
    meta: { title: '图书查询', requiresAuth: true, role: 'user' }
  },
  {
    path: '/borrow-info',
    name: 'BorrowInfo',
    component: () => import('@/views/BorrowInfo.vue'),
    meta: { title: '借阅信息', requiresAuth: true, role: 'user' }
  },
  // ==================== 后台管理端 ====================
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/AdminLogin.vue'),
    meta: { title: '管理员登录', guest: true }
  },
  {
    path: '/admin',
    component: () => import('@/views/Layout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    redirect: '/admin/user-manage',
    children: [
      {
        path: 'user-manage',
        name: 'UserManage',
        component: () => import('@/views/UserManage.vue'),
        meta: { title: '用户管理', requiresAuth: true, role: 'admin' }
      },
      {
        path: 'borrow-history',
        name: 'BorrowHistory',
        component: () => import('@/views/BorrowHistory.vue'),
        meta: { title: '借阅历史', requiresAuth: true, role: 'admin' }
      },
      {
        path: 'book-manage',
        name: 'BookManage',
        component: () => import('@/views/BookManage.vue'),
        meta: { title: '图书管理', requiresAuth: true, role: 'admin' }
      },
      {
        path: 'purchase-manage',
        name: 'PurchaseManage',
        component: () => import('@/views/PurchaseManage.vue'),
        meta: { title: '采购管理', requiresAuth: true, role: 'admin' }
      },
      {
        path: 'system-manage',
        name: 'SystemManage',
        component: () => import('@/views/SystemManage.vue'),
        meta: { title: '系统管理', requiresAuth: true, role: 'admin' }
      }
    ]
  },
  // ==================== 404 ====================
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ==================== 路由守卫 ====================
/**
 * 路由前置守卫 - 实现完整的访问控制逻辑
 * 
 * 三分支访问控制策略：
 * 
 * 1. 游客页面分支（guest: true）
 *    - 场景：读者登录页 /login、管理员登录页 /admin/login
 *    - 已登录用户访问 → 自动跳转对应角色的首页
 *      - admin角色 → /admin/user-manage
 *      - user角色 → /book-query
 *    - 未登录用户 → 正常访问登录页
 * 
 * 2. 需要登录的页面分支（requiresAuth: true）
 *    - 未登录用户 → 根据目标路径跳转对应登录页
 *      - /admin/* → /admin/login
 *      - 其他 → /login
 * 
 * 3. 角色权限校验分支
 *    - 当前用户角色与目标页面要求角色不匹配时
 *      - admin用户访问user页面 → 跳转到 /admin/user-manage
 *      - user用户访问admin页面 → 跳转到 /book-query
 * 
 * 4. 无特殊权限要求的页面 → 直接放行
 */
router.beforeEach((to, from, next) => {
  // 设置页面标题（统一添加系统名称后缀）
  document.title = to.meta.title ? `${to.meta.title} - 图书管理系统` : '图书管理系统'

  // 从localStorage获取当前登录用户（持久化登录状态）
  const currentUser = JSON.parse(localStorage.getItem('bms_currentUser'))
  const isAuthenticated = !!currentUser
  const requiredRole = to.meta.role

  // ========== 分支1：游客页面（登录页）访问控制 ==========
  if (to.meta.guest) {
    // 已登录用户不应访问登录页，自动跳转首页
    if (isAuthenticated) {
      next(currentUser.role === 'admin' ? '/admin/user-manage' : '/book-query')
    } else {
      // 未登录用户正常访问登录页
      next()
    }
    return // 终止后续逻辑
  }

  // ========== 分支2：需要登录的页面访问控制 ==========
  if (to.meta.requiresAuth) {
    // 用户未登录，跳转到对应登录页
    if (!isAuthenticated) {
      // 根据目标路径判断跳转到哪个登录页
      next(to.path.startsWith('/admin') ? '/admin/login' : '/login')
      return // 终止后续逻辑
    }

    // ========== 分支3：角色权限校验 ==========
    // 目标页面有角色要求，且当前用户角色不匹配
    if (requiredRole && currentUser.role !== requiredRole) {
      // 角色不匹配时，跳转到当前角色的首页
      next(currentUser.role === 'admin' ? '/admin/user-manage' : '/book-query')
      return // 终止后续逻辑
    }
  }

  // ========== 默认：无特殊权限要求，直接放行 ==========
  next()
})

export default router