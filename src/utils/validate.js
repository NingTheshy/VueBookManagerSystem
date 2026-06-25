/**
 * 表单验证工具
 * 提供可复用的验证规则和验证函数
 */

// ==================== 验证规则 ====================

/**
 * 必填验证
 * @param {string} message - 错误提示信息
 * @returns {Object} Element-Plus 表单验证规则
 */
export const required = (message = '此项为必填项') => ({
  required: true,
  message,
  trigger: 'blur'
})

/**
 * 手机号格式验证
 */
export const phoneRule = {
  pattern: /^1[3-9]\d{9}$/,
  message: '请输入正确的手机号码',
  trigger: 'blur'
}

/**
 * ISBN 格式验证
 */
export const isbnRule = {
  pattern: /^(?:\d{10}|\d{13}|[\d-]{13,17})$/,
  message: '请输入正确的 ISBN 编号',
  trigger: 'blur'
}

/**
 * 正整数验证
 */
export const positiveIntegerRule = {
  type: 'number',
  min: 1,
  message: '必须为正整数',
  trigger: 'blur'
}

/**
 * 价格验证（正数，最多两位小数）
 */
export const priceRule = {
  type: 'number',
  min: 0,
  message: '请输入有效的价格',
  trigger: 'blur'
}

// ==================== 验证函数 ====================

/**
 * 验证手机号
 * @param {string} value - 手机号
 * @returns {boolean}
 */
export function isValidPhone(value) {
  return /^1[3-9]\d{9}$/.test(value)
}

/**
 * 验证 ISBN
 * @param {string} value - ISBN 编号
 * @returns {boolean}
 */
export function isValidISBN(value) {
  return /^(?:\d{10}|\d{13}|[\d-]{13,17})$/.test(value)
}

/**
 * 验证是否为空
 * @param {string} value - 输入值
 * @returns {boolean}
 */
export function isEmpty(value) {
  return value === null || value === undefined || String(value).trim() === ''
}

/**
 * 验证是否为有效数字
 * @param {*} value - 输入值
 * @returns {boolean}
 */
export function isValidNumber(value) {
  return !isNaN(Number(value)) && isFinite(value)
}

/**
 * 验证是否为正整数
 * @param {*} value - 输入值
 * @returns {boolean}
 */
export function isPositiveInteger(value) {
  const num = Number(value)
  return Number.isInteger(num) && num > 0
}