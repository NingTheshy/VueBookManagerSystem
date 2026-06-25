/**
 * useConfigStore - 系统配置状态管理
 * 管理系统级别的设置项
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getConfig, setConfig } from '@/utils/storage'

export const useConfigStore = defineStore('config', () => {
  const config = ref(getConfig())

  function fetchConfig() {
    config.value = getConfig()
  }

  /**
   * 更新系统配置
   * @param {Object} newConfig - 部分或全部配置项
   */
  function updateConfig(newConfig) {
    config.value = { ...config.value, ...newConfig }
    setConfig(config.value)
  }

  /**
   * 重置为默认配置
   */
  function resetConfig() {
    config.value = {
      borrowDays: 30,
      pageSize: 10,
      enableCaptcha: true,
      adminPassword: 'YWRtaW4xMjM='
    }
    setConfig(config.value)
  }

  return {
    config,
    fetchConfig,
    updateConfig,
    resetConfig
  }
})