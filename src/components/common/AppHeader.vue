<template>
  <header class="app-header">
    <div class="header-left">
      <h1 class="header-title">图书管理系统</h1>
    </div>
    <div class="header-right">
      <span class="user-info">欢迎，<strong>{{ username }}</strong></span>
      <el-button type="danger" size="small" @click="handleLogout">
        <el-icon><SwitchButton /></el-icon>
        退出登录
      </el-button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = computed(() => {
  return authStore.currentUser?.username || '读者'
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 24px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  position: relative;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  font-size: 14px;
  opacity: 0.9;
}

.user-info strong {
  font-weight: 600;
}
</style>