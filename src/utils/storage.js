/**
 * localStorage 封装工具
 * 统一管理本地存储的读写操作，提供类型安全的键值存取
 */

// ==================== 存储 Key 常量 ====================
export const STORAGE_KEYS = {
  BOOKS: 'bms_books',
  USERS: 'bms_users',
  BORROWS: 'bms_borrows',
  PURCHASES: 'bms_purchases',
  LOGS: 'bms_logs',
  CONFIG: 'bms_config',
  CURRENT_USER: 'bms_currentUser',
  REMEMBERED_ADMIN: 'bms_rememberedAdmin',
  FEEDBACKS: 'bms_feedbacks'
}

// ==================== 通用读写 ====================

/**
 * 从 localStorage 读取 JSON 数据
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值
 * @returns {*} 解析后的数据
 */
function getItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * 将 JSON 数据写入 localStorage
 * @param {string} key - 存储键名
 * @param {*} value - 要存储的值
 */
function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`localStorage 写入失败 [${key}]:`, e)
  }
}

/**
 * 从 localStorage 移除指定键
 * @param {string} key - 存储键名
 */
function removeItem(key) {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.error(`localStorage 删除失败 [${key}]:`, e)
  }
}

// ==================== 业务数据存取 ====================

// 图书
export const getBooks = () => getItem(STORAGE_KEYS.BOOKS, [])
export const setBooks = (data) => setItem(STORAGE_KEYS.BOOKS, data)

// 用户
export const getUsers = () => getItem(STORAGE_KEYS.USERS, [])
export const setUsers = (data) => setItem(STORAGE_KEYS.USERS, data)

// 借阅
export const getBorrows = () => getItem(STORAGE_KEYS.BORROWS, [])
export const setBorrows = (data) => setItem(STORAGE_KEYS.BORROWS, data)

// 采购
export const getPurchases = () => getItem(STORAGE_KEYS.PURCHASES, [])
export const setPurchases = (data) => setItem(STORAGE_KEYS.PURCHASES, data)

// 日志
export const getLogs = () => getItem(STORAGE_KEYS.LOGS, [])
export const setLogs = (data) => setItem(STORAGE_KEYS.LOGS, data)

// 系统配置
const DEFAULT_CONFIG = {
  borrowDays: 30,
  pageSize: 10,
  enableCaptcha: true,
  adminPassword: 'YWRtaW4xMjM='
}
export const getConfig = () => getItem(STORAGE_KEYS.CONFIG, { ...DEFAULT_CONFIG })
export const setConfig = (data) => setItem(STORAGE_KEYS.CONFIG, data)

// 当前登录用户
export const getUser = () => getItem(STORAGE_KEYS.CURRENT_USER, null)
export const setUser = (user) => setItem(STORAGE_KEYS.CURRENT_USER, user)
export const removeUser = () => removeItem(STORAGE_KEYS.CURRENT_USER)

// 记住的管理员
export const getRememberedAdmin = () => getItem(STORAGE_KEYS.REMEMBERED_ADMIN, null)
export const setRememberedAdmin = (data) => setItem(STORAGE_KEYS.REMEMBERED_ADMIN, data)
export const removeRememberedAdmin = () => removeItem(STORAGE_KEYS.REMEMBERED_ADMIN)

// 用户反馈
export const getFeedbacks = () => getItem(STORAGE_KEYS.FEEDBACKS, [])
export const setFeedbacks = (data) => setItem(STORAGE_KEYS.FEEDBACKS, data)

// ==================== 密码编解码 ====================

/**
 * Base64 编码密码
 * @param {string} password - 明文密码
 * @returns {string} 编码后的密码
 */
export function encodePassword(password) {
  try {
    return btoa(unescape(encodeURIComponent(password)))
  } catch {
    return btoa(password)
  }
}

/**
 * Base64 解码密码
 * @param {string} encoded - 编码后的密码
 * @returns {string} 明文密码
 */
export function decodePassword(encoded) {
  try {
    return decodeURIComponent(escape(atob(encoded)))
  } catch {
    return atob(encoded)
  }
}

// ==================== 数据初始化 ====================

/**
 * 清除所有业务数据（用于数据重置）
 */
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => removeItem(key))
}

/**
 * 检查数据是否已初始化
 * @returns {boolean}
 */
export function isDataInitialized() {
  return localStorage.getItem(STORAGE_KEYS.BOOKS) !== null
}