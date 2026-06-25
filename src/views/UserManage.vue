<template>
  <div class="app-container">
    <!-- 搜索筛选区 -->
    <div class="search-box">
      <el-form :model="searchForm" inline label-width="68px">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入用户名"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="电话">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入电话"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="地址">
          <el-input
            v-model="searchForm.address"
            placeholder="请输入地址"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
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
          <el-button type="primary" plain :icon="Plus" @click="handleAdd">新增用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户表格 -->
      <el-table
        v-loading="loading"
        :data="pagedUsers"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="编号" width="120" align="center" show-overflow-tooltip />
        <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="phone" label="电话" min-width="130" align="center" />
        <el-table-column prop="age" label="年龄" width="70" align="center" />
        <el-table-column prop="address" label="地址" min-width="160" show-overflow-tooltip />
        <el-table-column prop="registeredAt" label="注册时间" min-width="160" align="center">
          <template #default="{ row }">
            {{ formatDate(row.registeredAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="borrowCount" label="借阅次数" width="90" align="center" />
        <el-table-column prop="debt" label="在借欠款" width="100" align="center">
          <template #default="{ row }">
            ¥{{ row.debt.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              :disabled="row.id === 'u000'"
              @click="handleDelete(row)"
            >
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
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number
            v-model="form.age"
            :min="0"
            :max="150"
            :step="1"
            placeholder="请输入年龄"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入地址" />
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
import { Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { required, phoneRule } from '@/utils/validate'
import Pagination from '@/components/common/Pagination.vue'

const userStore = useUserStore()

// ========== 搜索 ==========
const searchForm = reactive({
  keyword: '',
  phone: '',
  address: ''
})

function handleSearch() {
  userStore.updateFilters({
    keyword: searchForm.keyword,
    phone: searchForm.phone,
    address: searchForm.address
  })
  currentPage.value = 1
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.phone = ''
  searchForm.address = ''
  userStore.updateFilters({
    keyword: '',
    phone: '',
    address: ''
  })
  currentPage.value = 1
}

// ========== 分页 ==========
const currentPage = ref(1)
const pageSize = ref(10)

const filteredList = computed(() => userStore.filteredUsers)
const total = computed(() => filteredList.value.length)

const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

function handlePageChange({ page, pageSize: size }) {
  currentPage.value = page
  pageSize.value = size
}

// ========== 表格 loading ==========
const loading = computed(() => userStore.loading)

// ========== 弹窗 ==========
const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const isEdit = ref(false)
const editId = ref('')
const formRef = ref(null)
const submitLoading = ref(false)

const defaultForm = () => ({
  username: '',
  password: '',
  phone: '',
  age: undefined,
  address: ''
})

const form = reactive(defaultForm())

const rules = {
  username: [required('请输入用户名')],
  phone: [
    required('请输入手机号码'),
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur'
    }
  ]
}

function handleAdd() {
  isEdit.value = false
  editId.value = ''
  dialogTitle.value = '新增用户'
  Object.assign(form, defaultForm())
  dialogVisible.value = true
  setTimeout(() => formRef.value?.clearValidate(), 0)
}

function handleEdit(row) {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑用户'
  form.username = row.username
  form.password = ''
  form.phone = row.phone
  form.age = row.age
  form.address = row.address
  dialogVisible.value = true
  setTimeout(() => formRef.value?.clearValidate(), 0)
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (!isEdit.value) {
      userStore.addUser({
        username: form.username,
        password: form.password,
        phone: form.phone,
        age: form.age,
        address: form.address
      })
      ElMessage.success('新增用户成功')
    } else {
      userStore.updateUser(editId.value, {
        username: form.username,
        phone: form.phone,
        age: form.age,
        address: form.address
      })
      ElMessage.success('编辑用户成功')
    }
    dialogVisible.value = false
  } finally {
    submitLoading.value = false
  }
}

// ========== 删除 ==========
function handleDelete(row) {
  if (row.id === 'u000') {
    ElMessage.warning('管理员账户不可删除')
    return
  }
  ElMessageBox.confirm(
    `确定要删除用户「${row.username}」吗？`,
    '删除确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    userStore.deleteUser(row.id)
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
  userStore.fetchUsers()
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