<template>
  <div class="app-container">
    <!-- 搜索筛选区 -->
    <div class="search-box">
      <el-form :model="searchForm" inline label-width="68px">
        <el-form-item label="图书名称">
          <el-input
            v-model="searchForm.bookName"
            placeholder="请输入图书名称"
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
            placeholder="请输入作者"
            clearable
            style="width: 160px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 借阅表格 -->
    <div class="table-box">
      <el-table
        v-loading="loading"
        :data="pagedBorrows"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="编号" width="120" align="center" show-overflow-tooltip />
        <el-table-column prop="userName" label="借阅人" min-width="100" align="center" />
        <el-table-column prop="bookName" label="图书名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="bookCategory" label="分类" width="80" align="center" />
        <el-table-column prop="bookAuthor" label="作者" min-width="120" show-overflow-tooltip />
        <el-table-column prop="bookPrice" label="价格" width="100" align="center">
          <template #default="{ row }">
            ¥{{ row.bookPrice.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'returned'" type="success" size="small">已归还</el-tag>
            <el-tag v-else-if="row.status === 'borrowing'" size="small">借阅中</el-tag>
            <el-tag v-else-if="row.status === 'overdue'" type="danger" size="small">已过期</el-tag>
            <el-tag v-else type="info" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
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

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑借阅记录"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="借阅人" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入借阅人姓名" />
        </el-form-item>
        <el-form-item label="图书名称" prop="bookName">
          <el-input v-model="form.bookName" placeholder="请输入图书名称" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="借阅中" value="borrowing" />
            <el-option label="已归还" value="returned" />
            <el-option label="已过期" value="overdue" />
          </el-select>
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
import { Search, Refresh, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useBorrowStore } from '@/stores/borrow'
import { required } from '@/utils/validate'
import Pagination from '@/components/common/Pagination.vue'

const borrowStore = useBorrowStore()

// ========== 搜索 ==========
const searchForm = reactive({
  bookName: '',
  category: '',
  author: ''
})

function handleSearch() {
  borrowStore.updateFilters({
    bookName: searchForm.bookName,
    category: searchForm.category,
    author: searchForm.author
  })
  currentPage.value = 1
}

function handleReset() {
  searchForm.bookName = ''
  searchForm.category = ''
  searchForm.author = ''
  borrowStore.updateFilters({
    bookName: '',
    category: '',
    author: ''
  })
  currentPage.value = 1
}

// ========== 分页 ==========
const currentPage = ref(1)
const pageSize = ref(10)

const filteredList = computed(() => borrowStore.filteredBorrows)
const total = computed(() => filteredList.value.length)

const pagedBorrows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

function handlePageChange({ page, pageSize: size }) {
  currentPage.value = page
  pageSize.value = size
}

// ========== 表格 loading ==========
const loading = computed(() => borrowStore.loading)

// ========== 编辑弹窗 ==========
const dialogVisible = ref(false)
const editId = ref('')
const formRef = ref(null)
const submitLoading = ref(false)

const form = reactive({
  userName: '',
  bookName: '',
  status: ''
})

const rules = {
  userName: [required('请输入借阅人姓名')],
  bookName: [required('请输入图书名称')],
  status: [required('请选择状态')]
}

function handleEdit(row) {
  editId.value = row.id
  form.userName = row.userName
  form.bookName = row.bookName
  form.status = row.status
  dialogVisible.value = true
  setTimeout(() => formRef.value?.clearValidate(), 0)
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    borrowStore.updateBorrow(editId.value, {
      userName: form.userName,
      bookName: form.bookName,
      status: form.status
    })
    ElMessage.success('编辑成功')
    dialogVisible.value = false
  } finally {
    submitLoading.value = false
  }
}

// ========== 生命周期 ==========
onMounted(() => {
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