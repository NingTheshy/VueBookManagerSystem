/**
 * useAuthStore - 认证状态管理模块
 * 
 * 职责：
 * - 管理当前登录用户的状态（currentUser）
 * - 提供登录状态检查（isLoggedIn、isAdmin、isUser）
 * - 处理登录/登出操作，同步持久化到 localStorage
 * - 管理管理员"记住密码"功能（Base64 编码存储）
 * - 从 localStorage 恢复登录状态（页面刷新后保持登录）
 * 
 * 核心数据结构：
 * - currentUser: 当前登录用户对象（包含 id、username、role）
 * - rememberedAdmin: 记住的管理员密码（包含 username 和 Base64 编码的 password）
 * 
 * 持久化机制：
 * - currentUser 存储在 localStorage 的 'bms_currentUser' 键中
 * - rememberedAdmin 存储在 localStorage 的 'bms_rememberedAdmin' 键中
 * - 所有操作都自动同步到 localStorage，确保刷新页面后状态不丢失
 * 
 * 设计特点：
 * - 登录验证逻辑不在此 store 中实现，而是在 useUserStore 中完成密码匹配后调用 setCurrentUser
 * - role 属性决定用户权限：'admin' 可访问管理端，'user' 可访问读者端
 * - 提供 isAdmin、isUser 计算属性，方便模板中直接使用
 * 
 * 依赖：
 * - @/utils/storage: localStorage 持久化操作（getUser/setUser/removeUser 等）
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUser, setUser, removeUser, getRememberedAdmin, setRememberedAdmin, removeRememberedAdmin } from '@/utils/storage'

export const useAuthStore = defineStore('auth', () => {
  // ========== State ==========
  // 当前登录用户（从 localStorage 初始化，支持页面刷新后恢复登录状态）
  const currentUser = ref(getUser())
  // 记住的管理员密码（用于自动填充登录表单）
  const rememberedAdmin = ref(getRememberedAdmin())

  // ========== Getters ==========
  const isLoggedIn = computed(() => !!currentUser.value)       // 是否已登录
  const isAdmin = computed(() => currentUser.value?.role === 'admin') // 是否为管理员
  const isUser = computed(() => currentUser.value?.role === 'user')   // 是否为普通用户

  // ========== Actions ==========
  /**
   * 用户登录（空实现）
   * 
   * 说明：此方法仅为接口兼容保留，实际登录验证逻辑在 useUserStore.login() 中实现。
   * 登录成功后，useUserStore 会调用 setCurrentUser() 设置登录状态。
   * 
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @param {string} role - 角色（'admin' | 'user'）
   * @returns {boolean} 始终返回 true
   */
  function login(username, password, role) {
    return true
  }

  /**
   * 设置当前登录用户
   * 
   * 执行流程：
   * 1. 更新 currentUser 状态
   * 2. 同步到 localStorage（持久化存储）
   * 
   * 调用时机：登录成功后由 useUserStore.login() 调用
   * 
   * @param {Object} user - 用户对象
   */
  function setCurrentUser(user) {
    currentUser.value = user
    setUser(user) // 同步持久化到 localStorage
  }

  /**
   * 用户登出
   * 
   * 执行流程：
   * 1. 清空 currentUser 状态
   * 2. 从 localStorage 移除登录信息
   * 
   * 调用时机：用户点击退出登录时
   */
  function logout() {
    currentUser.value = null
    removeUser() // 从 localStorage 移除登录状态
  }

  /**
   * 记住管理员密码
   * 
   * 注意：密码参数应为 Base64 编码后的字符串，避免明文存储
   * 
   * @param {string} username - 管理员用户名
   * @param {string} password - 管理员密码（Base64 编码）
   */
  function rememberAdmin(username, password) {
    rememberedAdmin.value = { username, password }
    setRememberedAdmin({ username, password }) // 同步持久化到 localStorage
  }

  /**
   * 清除记住的管理员密码
   * 
   * 调用时机：用户取消"记住密码"选项时，或登录失败时
   */
  function clearRememberedAdmin() {
    rememberedAdmin.value = null
    removeRememberedAdmin() // 从 localStorage 移除
  }

  /**
   * 检查登录状态（从 localStorage 恢复）
   * 
   * 调用时机：页面初始化时，确保状态与 localStorage 同步
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