/**
 * useBookStore - 图书状态管理
 * 管理图书数据的增删改查与筛选
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

  function incrementBorrowCount(id) {
    const book = books.value.find(b => b.id === id)
    if (book) {
      book.borrowCount++
      book.status = (book.totalCount - book.borrowCount) > 0 ? 'available' : 'unavailable'
      setBooks(books.value)
    }
  }

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