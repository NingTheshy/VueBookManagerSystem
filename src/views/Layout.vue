<template>
  <div class="app-wrapper">
    <!-- 左侧导航菜单 -->
    <div class="sidebar-container" :class="{ collapsed: isCollapse }">
      <div class="logo-area" :class="{ collapse: isCollapse }">
        <div class="logo-gradient-overlay"></div>
        <el-icon :size="26" class="logo-icon-svg">
          <Reading />
        </el-icon>
        <span v-show="!isCollapse" class="logo-text">图书管理系统</span>
      </div>
      <div class="sidebar-divider"></div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="transparent"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
      >
        <el-menu-item index="/admin">
          <el-icon><DataBoard /></el-icon>
          <span>系统首页</span>
        </el-menu-item>
        <el-menu-item index="/admin/user-manage">
          <el-icon><User /></el-icon>
          <span>用户信息管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/borrow-history">
          <el-icon><Clock /></el-icon>
          <span>借阅历史管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/book-manage">
          <el-icon><Notebook /></el-icon>
          <span>图书信息管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/purchase-manage">
          <el-icon><ShoppingCart /></el-icon>
          <span>采购管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/system-manage">
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-version" v-show="!isCollapse">v2.0.0</div>
    </div>

    <!-- 右侧主体 -->
    <div class="main-container">
      <!-- 导航栏 -->
      <div class="navbar">
        <div class="navbar-left">
          <div class="hamburger" @click="toggleSidebar">
            <el-icon :size="20">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </div>
          <el-breadcrumb separator="" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              <span class="breadcrumb-separator">/</span>
              {{ item.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="navbar-right">
          <el-dropdown trigger="click">
            <span class="user-area">
              <el-icon :size="18"><Avatar /></el-icon>
              <span class="username">{{ adminName }}</span>
              <el-icon :size="12"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-icon><Key /></el-icon>
                  <span>修改密码</span>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 标签页 -->
      <div class="tags-view">
        <div class="tags-scroll-hint tags-scroll-left">
          <el-icon :size="12"><ArrowLeft /></el-icon>
        </div>
        <div class="tags-wrapper" ref="tagsWrapperRef">
          <span
            v-for="tag in visitedViews"
            :key="tag.path"
            class="tags-item"
            :class="{ active: isActiveTag(tag) }"
            @click="goToTag(tag)"
          >
            <span class="tags-dot"></span>
            {{ tag.title }}
            <el-icon
              v-if="visitedViews.length > 1"
              class="tags-close"
              :size="12"
              @click.stop="handleCloseTag(tag)"
            >
              <Close />
            </el-icon>
          </span>
        </div>
        <div class="tags-scroll-hint tags-scroll-right">
          <el-icon :size="12"><ArrowRight /></el-icon>
        </div>
        <el-dropdown trigger="click" class="tags-dropdown">
          <span class="tags-dropdown-btn">
            <el-icon :size="14"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleCloseOthers">关闭其他</el-dropdown-item>
              <el-dropdown-item @click="handleCloseAll">关闭所有</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 主内容区 -->
      <div class="app-main">
        <div class="app-main-inner">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  DataBoard, User, Clock, Notebook, ShoppingCart, Setting,
  Fold, Expand, Avatar, ArrowDown, ArrowLeft, ArrowRight,
  Key, SwitchButton, Close, Reading
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isCollapse = ref(false)           // 侧边栏折叠状态
const visitedViews = ref([])            // 已访问的标签页列表
const tagsWrapperRef = ref(null)        // 标签页容器引用（用于滚动）

const activeMenu = computed(() => route.path)                    // 当前激活的菜单路径
const adminName = computed(() => authStore.currentUser?.username || 'admin') // 当前管理员名称

// 面包屑导航计算 - 过滤掉根路由 /admin，只显示子路由层级
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  if (matched.length > 0 && matched[0].path === '/admin') {
    return matched.slice(1)
  }
  return matched
})

// 切换侧边栏折叠状态
function toggleSidebar() {
  isCollapse.value = !isCollapse.value
}

// 判断标签是否为当前激活状态
function isActiveTag(tag) {
  return tag.path === route.path
}

/**
 * 添加已访问视图到标签页列表
 * 
 * 逻辑说明：
 * 1. 只有包含 meta.title 的路由才会添加标签页（排除无标题的路由）
 * 2. 避免重复添加：检查 path 是否已存在于列表中
 * 3. 记录完整路径（fullPath），支持带查询参数的路由
 * 
 * 使用场景：路由切换时自动调用（通过 watch 监听 route.path）
 */
function addVisitedView() {
  const { path, meta } = route
  // 无标题的路由不添加标签页
  if (!meta.title) return
  
  // 检查是否已存在，避免重复添加
  const existing = visitedViews.value.find(v => v.path === path)
  if (!existing) {
    visitedViews.value.push({
      path,
      title: meta.title,
      fullPath: route.fullPath  // 保留完整路径，支持带查询参数的路由
    })
  }
}

// 点击标签页跳转到对应路由
function goToTag(tag) {
  router.push(tag.fullPath || tag.path)
}

/**
 * 关闭单个标签页
 * 
 * 边缘情况处理：
 * 1. 如果关闭的是当前激活的标签页 → 需要跳转到相邻标签页
 *    - 优先跳转到同一位置的下一个标签（index 不变）
 *    - 如果下一个不存在，则跳转到前一个标签（index - 1）
 * 2. 如果列表中只有一个标签页 → 关闭后列表为空，不跳转（除非用户手动关闭）
 * 
 * 注意：关闭按钮仅在标签页数量 > 1 时显示（template 中已处理）
 */
function handleCloseTag(tag) {
  // 查找要关闭的标签页索引
  const index = visitedViews.value.findIndex(v => v.path === tag.path)
  if (index === -1) return

  // 从列表中移除该标签页
  visitedViews.value.splice(index, 1)

  // 如果关闭的是当前激活的标签页，需要跳转到相邻标签
  if (isActiveTag(tag)) {
    // 优先选择下一个标签，若无则选择前一个
    const nextTag = visitedViews.value[index] || visitedViews.value[index - 1]
    if (nextTag) {
      router.push(nextTag.fullPath || nextTag.path)
    }
  }
}

/**
 * 关闭其他标签页
 * 
 * 逻辑：保留当前激活的标签页，移除所有其他标签页
 * 如果当前路由不在标签列表中（异常情况），则清空列表
 */
function handleCloseOthers() {
  const currentTag = visitedViews.value.find(v => v.path === route.path)
  visitedViews.value = currentTag ? [currentTag] : []
}

/**
 * 关闭所有标签页
 * 
 * 逻辑：清空标签列表并跳转到管理员首页（/admin）
 * 确保用户不会停留在空白页面
 */
function handleCloseAll() {
  visitedViews.value = []
  router.push('/admin')
}

// 退出登录 - 清除认证状态并跳转到管理员登录页
function handleLogout() {
  authStore.logout()
  router.push('/admin/login')
}

// 监听路由变化，自动添加标签页（立即执行一次以初始化）
watch(
  () => route.path,
  () => {
    addVisitedView()
  },
  { immediate: true }
)
</script>

<style scoped>
/* ================================================================
   Layout — Premium RuoYi-Style Admin Dashboard
   ================================================================ */
.app-wrapper {
  display: flex;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* ========== 侧边栏 ========== */
.sidebar-container {
  flex-shrink: 0;
  width: 200px;
  height: 100%;
  background: linear-gradient(180deg, #2d3f55 0%, #304156 100%);
  transition: width var(--transition-base);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.sidebar-container.collapsed {
  width: 64px;
}

/* Logo area */
.logo-area {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  gap: 10px;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(4px);
  border-radius: 0 12px 0 0;
  flex-shrink: 0;
}

.logo-gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.12) 0%, transparent 60%);
  pointer-events: none;
}

.logo-icon-svg {
  color: #fff;
  flex-shrink: 0;
  filter: drop-shadow(0 0 6px rgba(64, 158, 255, 0.5));
  transition: transform var(--transition-base);
  z-index: 1;
}

.logo-area:hover .logo-icon-svg {
  transform: scale(1.08);
}

.logo-text {
  white-space: nowrap;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1.5px;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

/* Divider between logo & menu */
.sidebar-divider {
  height: 1px;
  margin: 0 12px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 15%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.1) 85%, transparent 100%);
  flex-shrink: 0;
}

/* Menu */
.sidebar-menu {
  border-right: none !important;
  width: 100%;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}

/* Menu item hover accent */
.sidebar-menu :deep(.el-menu-item) {
  border-left: 3px solid transparent;
  transition: all var(--transition-fast);
  height: 48px;
  line-height: 48px;
  margin: 2px 0;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-left-color: var(--color-primary);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.15) 0%, rgba(64, 158, 255, 0.05) 100%) !important;
  border-left-color: var(--color-primary);
  color: var(--color-primary) !important;
}

.sidebar-menu :deep(.el-menu-item .el-icon) {
  font-size: 16px;
}

/* Version text */
.sidebar-version {
  padding: 8px 16px;
  font-size: 11px;
  color: rgba(191, 203, 217, 0.45);
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

/* ========== 主容器 ========== */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* ========== 导航栏 ========== */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--navbar-height);
  padding: 0 16px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  z-index: 10;
  position: relative;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hamburger {
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  color: var(--text-regular);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.hamburger:hover {
  color: var(--color-primary);
  background-color: var(--color-primary-lightest);
}

.breadcrumb {
  line-height: 50px;
}

.breadcrumb :deep(.el-breadcrumb__item) {
  display: inline-flex;
  align-items: center;
}

.breadcrumb :deep(.el-breadcrumb__inner) {
  color: var(--text-secondary);
  font-weight: 400;
  transition: color var(--transition-fast);
}

.breadcrumb :deep(.el-breadcrumb__inner:hover) {
  color: var(--color-primary);
}

.breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--text-primary);
  font-weight: 500;
}

.breadcrumb-separator {
  margin: 0 6px;
  color: var(--text-placeholder);
  font-weight: 300;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--text-regular);
  font-size: 14px;
  padding: 6px 10px;
  border-radius: var(--radius-round);
  transition: all var(--transition-fast);
}

.user-area:hover {
  background: var(--bg-hover);
  color: var(--color-primary);
}

.username {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ========== 标签页 ========== */
.tags-view {
  display: flex;
  align-items: center;
  height: var(--tags-height);
  background: #fff;
  border-bottom: 1px solid var(--border-light);
  padding: 0 8px;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.tags-scroll-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: var(--text-placeholder);
  flex-shrink: 0;
  cursor: default;
  opacity: 0.4;
}

.tags-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 6px;
  height: 100%;
  padding: 0 4px;
}

.tags-wrapper::-webkit-scrollbar {
  height: 2px;
}

.tags-wrapper::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: var(--text-placeholder);
}

.tags-item {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px 0 8px;
  font-size: 12px;
  color: var(--text-regular);
  background: var(--bg-container);
  border: 1px solid var(--border-lighter);
  border-radius: 15px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all var(--transition-fast);
  position: relative;
}

.tags-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-placeholder);
  margin-right: 5px;
  flex-shrink: 0;
  transition: background var(--transition-fast);
}

.tags-item:hover {
  color: var(--color-primary);
  border-color: var(--color-primary-lighter);
  background: var(--color-primary-lightest);
}

.tags-item:hover .tags-dot {
  background: var(--color-primary);
}

.tags-item.active {
  color: #fff;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-color: var(--color-primary);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
}

.tags-item.active .tags-dot {
  background: #fff;
}

.tags-close {
  margin-left: 6px;
  border-radius: 50%;
  transition: all var(--transition-fast);
  padding: 1px;
}

.tags-close:hover {
  background: rgba(0, 0, 0, 0.15);
  transform: scale(1.1);
}

.tags-item.active .tags-close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.tags-dropdown {
  flex-shrink: 0;
  margin-left: 4px;
}

.tags-dropdown-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  border: 1px solid var(--border-lighter);
  border-radius: 12px;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.tags-dropdown-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary-lighter);
  background: var(--color-primary-lightest);
}

/* ========== 主内容 ========== */
.app-main {
  flex: 1;
  overflow-y: auto;
  background-color: var(--bg-page);
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.04);
  position: relative;
}

.app-main-inner {
  padding: var(--content-padding);
  min-height: 100%;
}

/* ========== 响应式侧边栏折叠动画提示 ========== */
@media (max-width: 768px) {
  .sidebar-container {
    position: absolute;
    z-index: 100;
    height: 100vh;
    transition: transform var(--transition-base);
  }

  .sidebar-container.collapsed {
    transform: translateX(-64px);
  }
}

/* Transition helper for collapse */
.sidebar-container {
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>