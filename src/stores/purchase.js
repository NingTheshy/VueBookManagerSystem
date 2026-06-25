/**
 * usePurchaseStore - 采购状态管理
 * 管理采购记录的增删改查与状态跟踪
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