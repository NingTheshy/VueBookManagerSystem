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
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 图书管理系统` : '图书管理系统'

  const currentUser = JSON.parse(localStorage.getItem('bms_currentUser'))
  const isAuthenticated = !!currentUser
  const requiredRole = to.meta.role

  // 游客页面（登录页），已登录则跳转对应首页
  if (to.meta.guest) {
    if (isAuthenticated) {
      if (currentUser.role === 'admin') {
        next('/admin/user-manage')
      } else {
        next('/book-query')
      }
    } else {
      next()
    }
    return
  }

  // 需要登录的页面
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      // 未登录，根据目标路径跳转对应登录页
      if (to.path.startsWith('/admin')) {
        next('/admin/login')
      } else {
        next('/login')
      }
      return
    }

    // 角色权限校验
    if (requiredRole && currentUser.role !== requiredRole) {
      if (currentUser.role === 'admin') {
        next('/admin/user-manage')
      } else {
        next('/book-query')
      }
      return
    }
  }

  next()
})

export default router