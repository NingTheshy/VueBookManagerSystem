/**
 * useUserStore - 用户状态管理
 * 管理用户数据的增删改查与登录注册
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