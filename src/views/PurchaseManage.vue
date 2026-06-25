<template>
  <div class="app-container">
    <!-- 搜索筛选区 -->
    <div class="search-box">
      <el-form :model="searchForm" inline label-width="68px">
        <el-form-item label="书籍名称">
          <el-input
            v-model="searchForm.bookName"
            placeholder="请输入书籍名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="采购金额">
          <el-input-number
            v-model="searchForm.amountMin"
            :min="0"
            :precision="2"
            placeholder="最低"
            style="width: 140px"
            controls-position="right"
          />
          <span style="margin: 0 8px; color: #909399">—</span>
          <el-input-number
            v-model="searchForm.amountMax"
            :min="0"
            :precision="2"
            placeholder="最高"
            style="width: 140px"
            controls-position="right"
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
          <el-button type="primary" plain :icon="Plus" @click="handleAdd">新增采购</el-button>
        </el-col>
      </el-row>

      <!-- 采购列表表格 -->
      <el-table
        v-loading="purchaseStore.loading"
        :data="paginatedData"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="编号" width="100" show-overflow-tooltip />
        <el-table-column prop="bookName" label="书籍名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="amount" label="采购金额" width="130" align="right">
          <template #default="{ row }">
            <span style="color: #e6a23c; font-weight: 500">¥{{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="采购数量" width="100" align="center" />
        <el-table-column prop="responsible" label="采购负责人" width="120" align="center" />
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待审批</el-tag>
            <el-tag v-else-if="row.status === 'approved'" type="info">已审批</el-tag>
            <el-tag v-else-if="row.status === 'completed'" type="success">已采购</el-tag>
            <el-tag v-else>{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              link
              @click="handleStatusChange(row, 'approved')"
            >
              审批通过
            </el-button>
            <el-button
              v-if="row.status === 'approved'"
              type="success"
              size="small"
              link
              @click="handleStatusChange(row, 'completed')"
            >
              确认采购
            </el-button>
            <el-button type="primary" size="small" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="filteredTotal > 0"
        :total="filteredTotal"
        v-model="currentPage"
        v-model:page-size="pageSize"
        @change="handlePageChange"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="书籍名称" prop="bookName">
          <el-input
            v-model="formData.bookName"
            placeholder="请输入书籍名称"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="采购金额" prop="amount">
          <el-input-number
            v-model="formData.amount"
            :min="0.01"
            :precision="2"
            :step="100"
            placeholder="请输入采购金额"
            style="width: 100%"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="采购数量" prop="quantity">
          <el-input-number
            v-model="formData.quantity"
            :min="1"
            :step="1"
            placeholder="请输入采购数量"
            style="width: 100%"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="采购负责人" prop="responsible">
          <el-input
            v-model="formData.responsible"
            placeholder="请输入采购负责人"
            maxlength="50"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import { usePurchaseStore } from '@/stores/purchase'
import { formatDateTime } from '@/utils/id'
import { ElMessage, ElMessageBox } from 'element-plus'

const purchaseStore = usePurchaseStore()

// ========== 搜索 ==========
const searchForm = reactive({
  bookName: '',
  amountMin: undefined,
  amountMax: undefined
})

function handleSearch() {
  purchaseStore.updateFilters({
    bookName: searchForm.bookName || '',
    amountRange: [
      searchForm.amountMin != null ? searchForm.amountMin : 0,
      searchForm.amountMax != null ? searchForm.amountMax : 99999
    ]
  })
  currentPage.value = 1
}

function handleReset() {
  searchForm.bookName = ''
  searchForm.amountMin = undefined
  searchForm.amountMax = undefined
  purchaseStore.updateFilters({
    bookName: '',
    amountRange: [0, 99999]
  })
  currentPage.value = 1
}

// ========== 分页 ==========
const currentPage = ref(1)
const pageSize = ref(10)

const filteredTotal = computed(() => purchaseStore.filteredPurchases.length)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return purchaseStore.filteredPurchases.slice(start, end)
})

function handlePageChange({ page, pageSize: size }) {
  currentPage.value = page
  pageSize.value = size
}

// ========== 新增/编辑弹窗 ==========
const dialogVisible = ref(false)
const dialogTitle = ref('新增采购')
const submitLoading = ref(false)
const formRef = ref(null)
const editingId = ref(null)

const formData = reactive({
  bookName: '',
  amount: null,
  quantity: null,
  responsible: ''
})

const formRules = {
  bookName: [
    { required: true, message: '请输入书籍名称', trigger: 'blur' }
  ],
  amount: [
    { required: true, message: '请输入采购金额', trigger: 'blur' }
  ],
  quantity: [
    { required: true, message: '请输入采购数量', trigger: 'blur' }
  ],
  responsible: [
    { required: true, message: '请输入采购负责人', trigger: 'blur' }
  ]
}

function resetForm() {
  formData.bookName = ''
  formData.amount = null
  formData.quantity = null
  formData.responsible = ''
  editingId.value = null
  formRef.value?.resetFields()
}

function handleAdd() {
  dialogTitle.value = '新增采购'
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row) {
  dialogTitle.value = '编辑采购'
  editingId.value = row.id
  formData.bookName = row.bookName
  formData.amount = row.amount
  formData.quantity = row.quantity
  formData.responsible = row.responsible
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (editingId.value) {
      purchaseStore.updatePurchase(editingId.value, {
        bookName: formData.bookName,
        amount: formData.amount,
        quantity: formData.quantity,
        responsible: formData.responsible
      })
      ElMessage.success('编辑成功')
    } else {
      purchaseStore.addPurchase({
        bookName: formData.bookName,
        amount: formData.amount,
        quantity: formData.quantity,
        responsible: formData.responsible
      })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
  } finally {
    submitLoading.value = false
  }
}

// ========== 状态变更 ==========
function handleStatusChange(row, newStatus) {
  const statusLabels = {
    approved: '审批通过',
    completed: '确认采购'
  }
  const label = statusLabels[newStatus] || '变更状态'
  ElMessageBox.confirm(
    `确认将采购单「${row.bookName}」${label}？`,
    '操作确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    purchaseStore.updateStatus(row.id, newStatus)
    ElMessage.success(`${label}成功`)
  }).catch(() => {})
}

// ========== 删除 ==========
function handleDelete(row) {
  ElMessageBox.confirm(
    `确认删除采购单「${row.bookName}」？删除后不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    purchaseStore.deletePurchase(row.id)
    ElMessage.success('删除成功')
    // 如果当前页数据为空，回到上一页
    if (paginatedData.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  }).catch(() => {})
}

// ========== 初始化 ==========
onMounted(() => {
  purchaseStore.fetchPurchases()
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