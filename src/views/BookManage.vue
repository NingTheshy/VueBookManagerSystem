<template>
  <div class="app-container">
    <!-- 搜索筛选区 -->
    <div class="search-box">
      <el-form :model="searchForm" inline label-width="68px">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="书名/作者"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="全部分类" clearable style="width: 140px">
            <el-option label="科技" value="科技" />
            <el-option label="文学" value="文学" />
            <el-option label="科幻" value="科幻" />
            <el-option label="历史" value="历史" />
            <el-option label="教育" value="教育" />
          </el-select>
        </el-form-item>
        <el-form-item label="作者">
          <el-input
            v-model="searchForm.author"
            placeholder="作者"
            clearable
            style="width: 160px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="价格范围">
          <el-input-number
            v-model="searchForm.priceMin"
            :min="0"
            :precision="2"
            placeholder="最低价"
            controls-position="right"
            style="width: 130px"
          />
          <span style="margin: 0 8px; color: #909399">—</span>
          <el-input-number
            v-model="searchForm.priceMax"
            :min="0"
            :precision="2"
            placeholder="最高价"
            controls-position="right"
            style="width: 130px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮区 & 表格 -->
    <div class="table-box">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" plain :icon="Plus" @click="handleAdd">新增图书</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            :icon="ShoppingCart"
            :disabled="selectedBooks.length === 0"
            @click="handleOrderGenerate"
          >订单生成</el-button>
        </el-col>
      </el-row>

      <!-- 图书表格 -->
      <el-table
        v-loading="loading"
        :data="pagedBooks"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="createdAt" label="创建时间" min-width="160" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="图书名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="80" align="center" />
        <el-table-column prop="author" label="作者" min-width="120" show-overflow-tooltip />
        <el-table-column prop="price" label="价格" width="100" align="center">
          <template #default="{ row }">
            ¥{{ row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="borrowCount" label="借阅数量" width="90" align="center" />
        <el-table-column label="在馆数量" width="90" align="center">
          <template #default="{ row }">
            {{ row.totalCount - row.borrowCount }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        v-model="currentPage"
        v-model:page-size="pageSize"
        @change="handlePageChange"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="书名" prop="name">
          <el-input v-model="form.name" placeholder="请输入图书名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="科技" value="科技" />
            <el-option label="文学" value="文学" />
            <el-option label="科幻" value="科幻" />
            <el-option label="历史" value="历史" />
            <el-option label="教育" value="教育" />
          </el-select>
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="出版社" prop="publisher">
          <el-input v-model="form.publisher" placeholder="请输入出版社" />
        </el-form-item>
        <el-form-item label="ISBN" prop="isbn">
          <el-input v-model="form.isbn" placeholder="请输入 ISBN 编号" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0"
            :precision="2"
            :step="1"
            placeholder="请输入价格"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="总数量" prop="totalCount">
          <el-input-number
            v-model="form.totalCount"
            :min="1"
            :step="1"
            placeholder="请输入总数量"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入图书描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确 定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Search, Refresh, Edit, Delete, ShoppingCart } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBookStore } from '@/stores/book'
import { useBorrowStore } from '@/stores/borrow'
import { usePurchaseStore } from '@/stores/purchase'
import { required, isbnRule, priceRule, positiveIntegerRule } from '@/utils/validate'
import Pagination from '@/components/common/Pagination.vue'

const bookStore = useBookStore()
const borrowStore = useBorrowStore()
const purchaseStore = usePurchaseStore()

// ========== 搜索 ==========
const searchForm = reactive({
  keyword: '',
  category: '',
  author: '',
  priceMin: undefined,
  priceMax: undefined
})

function handleSearch() {
  bookStore.updateFilters({
    keyword: searchForm.keyword,
    category: searchForm.category,
    author: searchForm.author,
    priceRange: [
      searchForm.priceMin !== undefined && searchForm.priceMin !== null ? searchForm.priceMin : 0,
      searchForm.priceMax !== undefined && searchForm.priceMax !== null ? searchForm.priceMax : 99999
    ]
  })
  currentPage.value = 1
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.category = ''
  searchForm.author = ''
  searchForm.priceMin = undefined
  searchForm.priceMax = undefined
  bookStore.updateFilters({
    keyword: '',
    category: '',
    author: '',
    priceRange: [0, 99999]
  })
  currentPage.value = 1
}

// ========== 表格选中 ==========
const selectedBooks = ref([])

function handleSelectionChange(selection) {
  selectedBooks.value = selection
}

// ========== 订单生成 ==========
function handleOrderGenerate() {
  if (selectedBooks.value.length === 0) {
    ElMessage.warning('请先勾选需要采购的图书')
    return
  }
  ElMessageBox.confirm(
    `确认将勾选的 ${selectedBooks.value.length} 本图书加入采购清单？`,
    '订单生成',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' }
  ).then(() => {
    selectedBooks.value.forEach(book => {
      purchaseStore.addPurchase({
        bookName: book.name,
        amount: book.price * 5,
        quantity: 5,
        responsible: '管理员'
      })
    })
    ElMessage.success(`已将 ${selectedBooks.value.length} 本图书加入采购清单`)
    selectedBooks.value = []
  }).catch(() => {})
}

// ========== 分页 ==========
const currentPage = ref(1)
const pageSize = ref(10)

const filteredList = computed(() => bookStore.filteredBooks)
const total = computed(() => filteredList.value.length)

const pagedBooks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

function handlePageChange({ page, pageSize: size }) {
  currentPage.value = page
  pageSize.value = size
}

// ========== 表格 loading ==========
const loading = computed(() => bookStore.loading)

// ========== 弹窗 ==========
const dialogVisible = ref(false)
const dialogTitle = ref('新增图书')
const isEdit = ref(false)
const editId = ref('')
const formRef = ref(null)
const submitLoading = ref(false)

const defaultForm = () => ({
  name: '',
  category: '',
  author: '',
  publisher: '',
  isbn: '',
  price: undefined,
  totalCount: 1,
  description: ''
})

const form = reactive(defaultForm())

const rules = {
  name: [required('请输入图书名称')],
  category: [required('请选择分类')],
  author: [required('请输入作者')],
  isbn: [
    required('请输入 ISBN 编号'),
    {
      validator: (_rule, value, callback) => {
        if (!value) return callback()
        if (/^(?:\d{10}|\d{13}|[\d-]{13,17})$/.test(value)) {
          callback()
        } else {
          callback(new Error('请输入正确的 ISBN 编号'))
        }
      },
      trigger: 'blur'
    }
  ],
  price: [
    required('请输入价格'),
    { type: 'number', min: 0, message: '价格不能为负数', trigger: 'blur' }
  ],
  totalCount: [
    required('请输入总数量'),
    { type: 'number', min: 1, message: '总数量至少为1', trigger: 'blur' }
  ]
}

function handleAdd() {
  isEdit.value = false
  editId.value = ''
  dialogTitle.value = '新增图书'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
  setTimeout(() => formRef.value?.clearValidate(), 0)
}

function handleEdit(row) {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑图书'
  form.name = row.name
  form.category = row.category
  form.author = row.author
  form.publisher = row.publisher
  form.isbn = row.isbn
  form.price = row.price
  form.totalCount = row.totalCount
  form.description = row.description
  dialogVisible.value = true
  setTimeout(() => formRef.value?.clearValidate(), 0)
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (!isEdit.value) {
      // ISBN 重复校验
      const duplicate = bookStore.books?.find(
        b => b.isbn === form.isbn && b.id !== editId.value
      )
      if (duplicate) {
        ElMessage.warning('该 ISBN 已存在，请检查后重新输入')
        submitLoading.value = false
        return
      }
      bookStore.addBook({ ...form })
      ElMessage.success('新增图书成功')
    } else {
      bookStore.updateBook(editId.value, { ...form })
      ElMessage.success('编辑图书成功')
    }
    dialogVisible.value = false
  } finally {
    submitLoading.value = false
  }
}

// ========== 删除 ==========
function handleDelete(row) {
  ElMessageBox.confirm(
    `确定要删除图书《${row.name}》吗？`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    // 检查是否有未归还借阅
    const hasUnreturned = borrowStore.borrows?.some(
      b => b.bookId === row.id && b.status === 'borrowing'
    )
    if (hasUnreturned) {
      ElMessage.warning('该图书有未归还借阅记录，不可删除')
      return
    }
    bookStore.deleteBook(row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// ========== 工具函数 ==========
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}:${s}`
}

// ========== 生命周期 ==========
onMounted(() => {
  bookStore.fetchBooks()
  borrowStore.fetchBorrows()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

/* Search area card */
.search-box {
  background: #fff;
  padding: 20px 20px 4px;
  border-radius: 6px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  border: 1px solid #ebeef5;
}

/* Table area card */
.table-box {
  background: #fff;
  padding: 16px 20px 4px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  border: 1px solid #ebeef5;
}

.mb8 {
  margin-bottom: 12px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}
</style>