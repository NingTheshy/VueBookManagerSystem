/**
 * usePurchaseStore - 采购状态管理模块
 * 
 * 职责：
 * - 管理图书采购订单的完整生命周期（创建、查询、修改、删除）
 * - 追踪采购订单的状态流转（待审核→已批准→已完成）
 * - 提供基于条件的采购记录筛选（图书名、金额范围）
 * - 每次操作自动写入操作日志
 * 
 * 核心数据结构（采购记录）：
 * - id: 采购订单唯一标识
 * - bookName: 图书名称
 * - amount: 采购总金额
 * - quantity: 采购数量
 * - responsible: 责任人
 * - status: 状态（'pending' | 'approved' | 'completed'）
 * - createdAt: 创建时间
 * 
 * 状态流转：
 * - pending（待审核）→ approved（已批准）→ completed（已完成）
 * - 只有管理员可以修改采购状态
 * 
 * 依赖：
 * - @/utils/storage: localStorage 持久化操作
 * - @/utils/id: ID生成工具
 * - @/stores/log: 操作日志记录
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getPurchases, setPurchases } from '@/utils/storage'
import { generateId } from '@/utils/id'
import { addLog } from './log'

export const usePurchaseStore = defineStore('purchase', () => {
  // ========== State ==========
  const purchases = ref([])
  const loading = ref(false)
  const filters = ref({
    bookName: '',
    amountRange: [0, 99999]
  })

  // ========== Getters ==========
  const filteredPurchases = computed(() => {
    let result = [...purchases.value]
    const f = filters.value

    if (f.bookName) {
      result = result.filter(p => p.bookName.includes(f.bookName))
    }
    result = result.filter(p => p.amount >= f.amountRange[0] && p.amount <= f.amountRange[1])

    return result
  })

  const purchaseById = (id) => computed(() =>
    purchases.value.find(p => p.id === id)
  )

  // ========== Actions ==========
  function fetchPurchases() {
    purchases.value = getPurchases()
  }

  function addPurchase(purchaseData) {
    const purchase = {
      id: generateId(),
      bookName: purchaseData.bookName,
      amount: purchaseData.amount,
      quantity: purchaseData.quantity,
      responsible: purchaseData.responsible,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    purchases.value.push(purchase)
    setPurchases(purchases.value)
    addLog('create', 'purchase', `新增了采购单《${purchase.bookName}》`)
    return purchase
  }

  function updatePurchase(id, purchaseData) {
    const index = purchases.value.findIndex(p => p.id === id)
    if (index !== -1) {
      purchases.value[index] = { ...purchases.value[index], ...purchaseData }
      setPurchases(purchases.value)
      addLog('update', 'purchase', `编辑了采购单《${purchases.value[index].bookName}》`)
    }
  }

  function deletePurchase(id) {
    const index = purchases.value.findIndex(p => p.id === id)
    if (index !== -1) {
      const name = purchases.value[index].bookName
      purchases.value.splice(index, 1)
      setPurchases(purchases.value)
      addLog('delete', 'purchase', `删除了采购单《${name}》`)
    }
  }

  /**
   * 更新采购状态
   * @param {string} id - 采购记录ID
   * @param {string} status - 新状态（'pending' | 'approved' | 'completed'）
   */
  function updateStatus(id, status) {
    const purchase = purchases.value.find(p => p.id === id)
    if (purchase) {
      purchase.status = status
      setPurchases(purchases.value)
      addLog('update', 'purchase', `更新采购单《${purchase.bookName}》状态为 ${status}`)
    }
  }

  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  return {
    purchases,
    loading,
    filters,
    filteredPurchases,
    purchaseById,
    fetchPurchases,
    addPurchase,
    updatePurchase,
    deletePurchase,
    updateStatus,
    updateFilters
  }
})