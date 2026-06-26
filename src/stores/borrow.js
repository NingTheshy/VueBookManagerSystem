/**
 * useBorrowStore - 借阅状态管理模块
 * 
 * 职责：
 * - 管理借阅记录的完整生命周期（创建、查询、归还、修改）
 * - 提供基于条件的借阅记录筛选（图书名、分类、作者、状态）
 * - 追踪当前用户的借阅记录
 * - 自动记录逾期借阅（status='overdue'）
 * - 每次操作自动写入操作日志
 * 
 * 核心数据结构（借阅记录）：
 * - id: 借阅记录唯一标识
 * - bookId/bookNo/bookName/bookCategory/bookAuthor/bookPrice: 关联图书信息
 * - userId/userAccount/userName: 关联用户信息
 * - borrowDate: 借阅日期
 * - dueDate: 预计归还日期
 * - returnDate: 实际归还日期（未归还时为null）
 * - status: 状态（'borrowing' | 'overdue' | 'returned'）
 * 
 * 依赖：
 * - @/utils/storage: localStorage 持久化操作
 * - @/utils/id: ID生成工具
 * - @/stores/log: 操作日志记录
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getBorrows, setBorrows } from '@/utils/storage'
import { generateId } from '@/utils/id'
import { addLog } from './log'

export const useBorrowStore = defineStore('borrow', () => {
  // ========== State ==========
  const borrows = ref([])
  const loading = ref(false)
  const filters = ref({
    bookName: '',
    category: '',
    author: '',
    status: ''
  })

  // ========== Getters ==========
  const filteredBorrows = computed(() => {
    let result = [...borrows.value]
    const f = filters.value

    if (f.bookName) {
      result = result.filter(b => b.bookName.includes(f.bookName))
    }
    if (f.category) {
      result = result.filter(b => b.bookCategory === f.category)
    }
    if (f.author) {
      result = result.filter(b => b.bookAuthor.includes(f.author))
    }
    if (f.status) {
      result = result.filter(b => b.status === f.status)
    }

    return result
  })

  const currentUserBorrows = computed(() => {
    const currentUser = JSON.parse(localStorage.getItem('bms_currentUser'))
    if (!currentUser) return []
    return borrows.value.filter(b => b.userId === currentUser.id)
  })

  const overdueBorrows = computed(() =>
    borrows.value.filter(b => b.status === 'overdue')
  )

  const borrowById = (id) => computed(() =>
    borrows.value.find(b => b.id === id)
  )

  // ========== Actions ==========
  function fetchBorrows() {
    borrows.value = getBorrows()
  }

  /**
   * 新增借阅记录
   * @param {Object} book - 图书对象
   * @param {Object} user - 用户对象
   * @param {number} borrowDays - 默认借阅天数
   */
  function addBorrow(book, user, borrowDays = 30) {
    const now = new Date()
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + borrowDays)

    const borrow = {
      id: generateId(),
      bookId: book.id,
      bookNo: book.bookNo,
      bookName: book.name,
      bookCategory: book.category,
      bookAuthor: book.author,
      bookPrice: book.price,
      userId: user.id,
      userAccount: user.username,
      userName: user.username,
      borrowDate: now.toISOString(),
      dueDate: dueDate.toISOString(),
      returnDate: null,
      status: 'borrowing'
    }
    borrows.value.push(borrow)
    setBorrows(borrows.value)
    addLog('borrow', 'borrow', `借阅了图书《${book.name}》`)
    return borrow
  }

  /**
   * 归还图书
   * @param {string} borrowId - 借阅记录ID
   */
  function returnBook(borrowId) {
    const borrow = borrows.value.find(b => b.id === borrowId)
    if (borrow) {
      borrow.returnDate = new Date().toISOString()
      borrow.status = 'returned'
      setBorrows(borrows.value)
      addLog('return', 'borrow', `归还了图书《${borrow.bookName}》`)
    }
  }

  function updateBorrow(id, data) {
    const index = borrows.value.findIndex(b => b.id === id)
    if (index !== -1) {
      borrows.value[index] = { ...borrows.value[index], ...data }
      setBorrows(borrows.value)
      addLog('update', 'borrow', `编辑了借阅记录`)
    }
  }

  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  return {
    borrows,
    loading,
    filters,
    filteredBorrows,
    currentUserBorrows,
    overdueBorrows,
    borrowById,
    fetchBorrows,
    addBorrow,
    returnBook,
    updateBorrow,
    updateFilters
  }
})