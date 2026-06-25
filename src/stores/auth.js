/**
 * authStore - 认证状态管理
 * 管理用户登录状态、身份验证与角色权限
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUser, setUser, removeUser, getRememberedAdmin, setRememberedAdmin, removeRememberedAdmin } from '@/utils/storage'

export const useAuthStore = defineStore('auth', () => {
  // ========== State ==========
  const currentUser = ref(getUser())
  const rememberedAdmin = ref(getRememberedAdmin())

  // ========== Getters ==========
  const isLoggedIn = computed(() => !!currentUser.value)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')
  const isUser = computed(() => currentUser.value?.role === 'user')

  // ========== Actions ==========
  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @param {string} role - 角色（'admin' | 'user'）
   * @returns {boolean} 是否登录成功
   */
  function login(username, password, role) {
    // 具体验证逻辑由业务层实现，此处仅设置登录态
    // 实际在 useUserStore 中完成密码匹配后调用此方法
    return true
  }

  /**
   * 设置当前登录用户
   * @param {Object} user - 用户对象
   */
  function setCurrentUser(user) {
    currentUser.value = user
    setUser(user)
  }

  /**
   * 登出
   */
  function logout() {
    currentUser.value = null
    removeUser()
  }

  /**
   * 记住管理员密码
   * @param {string} username - 管理员用户名
   * @param {string} password - 管理员密码（Base64 编码）
   */
  function rememberAdmin(username, password) {
    rememberedAdmin.value = { username, password }
    setRememberedAdmin({ username, password })
  }

  /**
   * 清除记住的管理员密码
   */
  function clearRememberedAdmin() {
    rememberedAdmin.value = null
    removeRememberedAdmin()
  }

  /**
   * 检查登录状态（从 localStorage 恢复）
   */
  function checkLoginStatus() {
    currentUser.value = getUser()
  }

  return {
    currentUser,
    rememberedAdmin,
    isLoggedIn,
    isAdmin,
    isUser,
    login,
    setCurrentUser,
    logout,
    rememberAdmin,
    clearRememberedAdmin,
    checkLoginStatus
  }
})