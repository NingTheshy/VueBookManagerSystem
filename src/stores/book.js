/**
 * useBookStore - 图书状态管理模块
 * 
 * 职责：
 * - 管理图书数据的完整生命周期（创建、查询、修改、删除）
 * - 提供多条件筛选（关键词、分类、作者、出版社、价格范围）
 * - 追踪图书库存状态（totalCount - borrowCount = 可借数量）
 * - 维护热门图书排行榜（按借阅次数排序）
 * - 每次操作自动写入操作日志
 * 
 * 核心数据结构（图书）：
 * - id: 图书唯一标识
 * - bookNo: 图书编号（格式：BK-YYYYNNNN）
 * - name: 图书名称
 * - category: 分类（科技、文学、科幻、历史、教育）
 * - author: 作者
 * - publisher: 出版社
 * - isbn: ISBN 编号
 * - price: 价格
 * - totalCount: 总数量
 * - borrowCount: 已借阅数量
 * - status: 状态（'available' | 'unavailable'）
 * - description: 描述
 * - createdAt: 创建时间
 * 
 * 库存计算：
 * - 可借数量 = totalCount - borrowCount
 * - 状态自动更新：可借数量 > 0 → 'available'，否则 → 'unavailable'
 * 
 * 依赖：
 * - @/utils/storage: localStorage 持久化操作
 * - @/utils/id: ID生成工具
 * - @/stores/log: 操作日志记录
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getBooks, setBooks } from '@/utils/storage'
import { generateId } from '@/utils/id'
import { addLog } from './log'

export const useBookStore = defineStore('book', () => {
  // ========== State ==========
  const books = ref([])
  const loading = ref(false)
  const filters = ref({
    keyword: '',
    category: '',
    author: '',
    publisher: '',
    priceRange: [0, 99999]
  })

  // ========== Getters ==========
  const filteredBooks = computed(() => {
    let result = [...books.value]
    const f = filters.value

    if (f.keyword) {
      const kw = f.keyword.toLowerCase()
      result = result.filter(b =>
        b.name.toLowerCase().includes(kw) ||
        b.author.toLowerCase().includes(kw)
      )
    }
    if (f.category) {
      result = result.filter(b => b.category === f.category)
    }
    if (f.author) {
      result = result.filter(b => b.author.includes(f.author))
    }
    if (f.publisher) {
      result = result.filter(b => b.publisher.includes(f.publisher))
    }
    result = result.filter(b => b.price >= f.priceRange[0] && b.price <= f.priceRange[1])

    return result
  })

  const availableBooks = computed(() =>
    books.value.filter(b => (b.totalCount - b.borrowCount) > 0)
  )

  const hotBooks = computed(() => {
    return [...books.value]
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 5)
  })

  const bookById = (id) => computed(() =>
    books.value.find(b => b.id === id)
  )

  // ========== Actions ==========
  function fetchBooks() {
    books.value = getBooks()
  }

  function addBook(bookData) {
    const book = {
      id: generateId(),
      bookNo: `BK-${new Date().getFullYear()}${String(books.value.length + 1).padStart(4, '0')}`,
      name: bookData.name,
      category: bookData.category,
      author: bookData.author,
      publisher: bookData.publisher,
      isbn: bookData.isbn,
      price: bookData.price,
      totalCount: bookData.totalCount,
      borrowCount: 0,
      status: 'available',
      description: bookData.description || '',
      createdAt: new Date().toISOString()
    }
    books.value.push(book)
    setBooks(books.value)
    addLog('create', 'book', `新增了图书《${book.name}》`)
    return book
  }

  function updateBook(id, bookData) {
    const index = books.value.findIndex(b => b.id === id)
    if (index !== -1) {
      const old = books.value[index]
      books.value[index] = { ...old, ...bookData }
      books.value[index].status = (books.value[index].totalCount - books.value[index].borrowCount) > 0
        ? 'available' : 'unavailable'
      setBooks(books.value)
      addLog('update', 'book', `编辑了图书《${books.value[index].name}》`)
    }
  }

  function deleteBook(id) {
    const index = books.value.findIndex(b => b.id === id)
    if (index !== -1) {
      const name = books.value[index].name
      books.value.splice(index, 1)
      setBooks(books.value)
      addLog('delete', 'book', `删除了图书《${name}》`)
    }
  }

  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * 增加借阅计数（借阅时调用）
   * 
   * 执行流程：
   * 1. 根据 ID 查找图书
   * 2. borrowCount + 1
   * 3. 自动更新状态：可借数量 > 0 → 'available'，否则 → 'unavailable'
   * 4. 同步持久化到 localStorage
   * 
   * 调用时机：用户借阅图书时（BookQuery.vue → handleBorrow）
   * 
   * @param {string} id - 图书 ID
   */
  function incrementBorrowCount(id) {
    const book = books.value.find(b => b.id === id)
    if (book) {
      book.borrowCount++
      book.status = (book.totalCount - book.borrowCount) > 0 ? 'available' : 'unavailable'
      setBooks(books.value)
    }
  }

  /**
   * 减少借阅计数（归还时调用）
   * 
   * 执行流程：
   * 1. 根据 ID 查找图书
   * 2. 只有当 borrowCount > 0 时才减 1（防止负数）
   * 3. 自动更新状态：可借数量 > 0 → 'available'，否则 → 'unavailable'
   * 4. 同步持久化到 localStorage
   * 
   * 调用时机：用户归还图书时（BorrowInfo.vue → handleReturn）
   * 
   * @param {string} id - 图书 ID
   */
  function decrementBorrowCount(id) {
    const book = books.value.find(b => b.id === id)
    if (book && book.borrowCount > 0) {
      book.borrowCount--
      book.status = (book.totalCount - book.borrowCount) > 0 ? 'available' : 'unavailable'
      setBooks(books.value)
    }
  }

  return {
    books,
    loading,
    filters,
    filteredBooks,
    availableBooks,
    hotBooks,
    bookById,
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
    updateFilters,
    incrementBorrowCount,
    decrementBorrowCount
  }
})