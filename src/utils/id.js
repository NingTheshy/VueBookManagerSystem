/**
 * ID 生成工具
 * 提供唯一标识符的生成函数
 */

/**
 * 生成唯一 ID
 * 优先使用 crypto.randomUUID()，降级使用时间戳+随机数方案
 * @returns {string} 唯一标识符
 */
export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // fallback: 时间戳 + 随机数
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10)
}

/**
 * 生成图书号
 * @param {number} index - 序号
 * @returns {string} 格式如 BK-20260001
 */
export function generateBookNo(index) {
  const year = new Date().getFullYear()
  return `BK-${year}${String(index).padStart(4, '0')}`
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date|string} date - 日期对象或 ISO 字符串
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss
 * @param {Date|string} date - 日期对象或 ISO 字符串
 * @returns {string}
 */
export function formatDateTime(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const dateStr = formatDate(d)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${dateStr} ${hours}:${minutes}:${seconds}`
}