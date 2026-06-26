/**
 * useUserStore - 用户状态管理模块
 * 
 * 职责：
 * - 管理用户数据的完整生命周期（创建、查询、修改、删除）
 * - 处理用户登录验证（密码比对）和注册（用户名去重）
 * - 提供多条件筛选（关键词、手机号、地址）
 * - 维护最佳读者排行榜（按借阅次数排序）
 * - 每次操作自动写入操作日志
 * 
 * 核心数据结构（用户）：
 * - id: 用户唯一标识
 * - username: 用户名（登录账号）
 * - password: 密码（Base64 编码存储）
 * - phone: 手机号
 * - age: 年龄
 * - address: 地址
 * - role: 角色（'admin' | 'user'）
 * - borrowCount: 借阅次数
 * - debt: 欠款金额
 * - registeredAt: 注册时间
 * 
 * 密码安全：
 * - 存储时使用 Base64 编码（encodePassword）
 * - 验证时解码后比对（decodeURIComponent(escape(atob(password)))）
 * - 注意：此为前端演示方案，生产环境应使用后端加密存储
 * 
 * 登录流程：
 * 1. 根据 username 和 role 查找用户
 * 2. 解码存储的密码
 * 3. 与输入密码比对
 * 4. 返回用户对象（成功）或 null（失败）
 * 
 * 依赖：
 * - @/utils/storage: localStorage 持久化操作 + 密码编码工具
 * - @/utils/id: ID生成工具
 * - @/stores/log: 操作日志记录
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUsers, setUsers } from '@/utils/storage'
import { generateId } from '@/utils/id'
import { encodePassword } from '@/utils/storage'
import { addLog } from './log'

export const useUserStore = defineStore('user', () => {
  // ========== State ==========
  const users = ref([])
  const loading = ref(false)
  const filters = ref({
    keyword: '',
    phone: '',
    address: ''
  })

  // ========== Getters ==========
  const filteredUsers = computed(() => {
    let result = [...users.value]
    const f = filters.value

    if (f.keyword) {
      const kw = f.keyword.toLowerCase()
      result = result.filter(u => u.username.toLowerCase().includes(kw))
    }
    if (f.phone) {
      result = result.filter(u => u.phone.includes(f.phone))
    }
    if (f.address) {
      result = result.filter(u => u.address.includes(f.address))
    }

    return result
  })

  const bestReaders = computed(() => {
    return [...users.value]
      .filter(u => u.role === 'user')
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 5)
  })

  const userById = (id) => computed(() =>
    users.value.find(u => u.id === id)
  )

  // ========== Actions ==========
  function fetchUsers() {
    users.value = getUsers()
  }

  function addUser(userData) {
    const user = {
      id: generateId(),
      username: userData.username,
      password: encodePassword(userData.password || '123456'),
      phone: userData.phone || '',
      age: userData.age || 0,
      address: userData.address || '',
      role: 'user',
      borrowCount: 0,
      debt: 0,
      registeredAt: new Date().toISOString()
    }
    users.value.push(user)
    setUsers(users.value)
    addLog('create', 'user', `新增了用户「${user.username}」`)
    return user
  }

  function updateUser(id, userData) {
    const index = users.value.findIndex(u => u.id === id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...userData }
      setUsers(users.value)
      addLog('update', 'user', `编辑了用户「${users.value[index].username}」`)
    }
  }

  function deleteUser(id) {
    const index = users.value.findIndex(u => u.id === id)
    if (index !== -1) {
      const name = users.value[index].username
      users.value.splice(index, 1)
      setUsers(users.value)
      addLog('delete', 'user', `删除了用户「${name}」`)
    }
  }

  /**
   * 验证用户登录
   * @param {string} username - 用户名
   * @param {string} password - 明文密码
   * @param {string} role - 期望角色
   * @returns {Object|null} 登录成功返回用户对象，失败返回 null
   */
  function login(username, password, role) {
    const user = users.value.find(
      u => u.username === username && u.role === role
    )
    if (!user) return null

    // 密码验证（实际比对前需解码存储的密码）
    try {
      const decoded = decodeURIComponent(escape(atob(user.password)))
      if (decoded !== password) return null
    } catch {
      return null
    }
    return user
  }

  /**
   * 注册新用户
   * @param {Object} userInfo - 用户信息
   * @returns {Object|null} 注册成功返回用户对象，失败返回 null
   */
  function register(userInfo) {
    // 检查用户名是否已存在
    if (users.value.find(u => u.username === userInfo.username)) {
      return null
    }
    return addUser(userInfo)
  }

  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  return {
    users,
    loading,
    filters,
    filteredUsers,
    bestReaders,
    userById,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    login,
    register,
    updateFilters
  }
})