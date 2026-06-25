/**
 * 数据初始化工具
 * 系统首次加载时从 Mock 数据初始化 localStorage
 */
import { isDataInitialized } from './storage'
import { setBooks, setUsers, setBorrows, setPurchases, setConfig, setFeedbacks } from './storage'
import { mockBooks } from '@/mock/books'
import { mockUsers } from '@/mock/users'
import { mockBorrows } from '@/mock/borrows'
import { mockPurchases } from '@/mock/purchases'

/**
 * 检查并初始化系统数据
 * 仅在 localStorage 中无数据时执行
 */
export function initData() {
  if (isDataInitialized()) return

  setBooks(mockBooks)
  setUsers(mockUsers)
  setBorrows(mockBorrows)
  setPurchases(mockPurchases)
  setFeedbacks([])

  // 系统默认配置
  setConfig({
    borrowDays: 30,
    pageSize: 10,
    enableCaptcha: true,
    adminPassword: 'YWRtaW4xMjM='
  })

  console.log('[图书管理系统] Mock 数据初始化完成')
}