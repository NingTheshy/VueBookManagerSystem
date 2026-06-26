/**
 * useLogStore - 操作日志状态管理模块
 * 
 * 职责：
 * - 记录系统中的所有关键操作（增删改查）
 * - 提供日志查询和清除功能
 * - 支持跨模块调用（通过导出的 addLog 函数）
 * 
 * 核心数据结构（日志记录）：
 * - id: 日志唯一标识
 * - operator: 操作人（当前登录用户或 'system'）
 * - actionType: 操作类型（'create' | 'update' | 'delete' | 'borrow' | 'return'）
 * - targetType: 操作对象（'book' | 'user' | 'borrow' | 'purchase' | 'system'）
 * - description: 操作描述（人类可读的文本）
 * - createdAt: 操作时间
 * 
 * 设计特点：
 * - 提供独立的 addLog 函数，可在任意 Store 或组件中调用
 * - 自动获取当前操作用户（从 localStorage 获取）
 * - 日志持久化存储，刷新页面后不丢失
 * 
 * 使用方式：
 * - 在其他 Store 中导入并调用 addLog(actionType, targetType, description)
 * - 在组件中使用 useLogStore() 获取日志列表
 * 
 * 依赖：
 * - @/utils/storage: localStorage 持久化操作
 * - @/utils/id: ID生成工具
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getLogs, setLogs } from '@/utils/storage'
import { generateId } from '@/utils/id'

export const useLogStore = defineStore('log', () => {
  const logs = ref([])

  function fetchLogs() {
    logs.value = getLogs()
  }

  function clearLogs() {
    logs.value = []
    setLogs([])
  }

  return {
    logs,
    fetchLogs,
    clearLogs
  }
})

/**
 * 记录操作日志（可在任意 Store 中调用）
 * @param {string} actionType - 操作类型
 * @param {string} targetType - 操作对象
 * @param {string} description - 操作描述
 */
export function addLog(actionType, targetType, description) {
  const currentUser = JSON.parse(localStorage.getItem('bms_currentUser'))
  const logs = getLogs()
  logs.push({
    id: generateId(),
    operator: currentUser ? currentUser.username : 'system',
    actionType,
    targetType,
    description,
    createdAt: new Date().toISOString()
  })
  setLogs(logs)
}