/**
 * useLogStore - 操作日志状态管理
 * 管理操作日志的记录与查询
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