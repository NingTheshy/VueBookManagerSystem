<template>
  <div class="app-container">
    <div class="system-container">
      <el-tabs v-model="activeTab">
        <!-- ==================== Tab 1: 系统设置 ==================== -->
        <el-tab-pane label="系统设置" name="settings">
          <el-form
            ref="settingsFormRef"
            :model="settingsForm"
            :rules="settingsRules"
            label-width="140px"
            style="max-width: 600px"
          >
            <el-form-item label="还书期限">
              <el-input-number
                v-model="settingsForm.borrowDays"
                :min="1"
                :max="365"
                :step="1"
                controls-position="right"
                style="width: 200px"
              />
              <span class="form-tip">天</span>
            </el-form-item>
            <el-form-item label="每页展示条数">
              <el-select
                v-model="settingsForm.pageSize"
                style="width: 200px"
              >
                <el-option :value="10" label="10 条/页" />
                <el-option :value="20" label="20 条/页" />
                <el-option :value="50" label="50 条/页" />
                <el-option :value="100" label="100 条/页" />
              </el-select>
            </el-form-item>
            <el-form-item label="验证码开关">
              <el-switch
                v-model="settingsForm.enableCaptcha"
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
            <el-form-item label="管理员密码" prop="adminPassword">
              <el-input
                v-model="settingsForm.adminPassword"
                type="password"
                show-password
                placeholder="请输入新密码（留空则不修改）"
                style="width: 280px"
                clearable
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="settingsLoading" @click="handleSaveSettings">
                保存设置
              </el-button>
              <el-button @click="handleResetSettings">恢复默认</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- ==================== Tab 2: 操作日志 ==================== -->
        <el-tab-pane label="操作日志" name="logs">
          <!-- 日志搜索 -->
          <el-form :model="logSearchForm" inline label-width="68px">
            <el-form-item label="操作时间">
              <el-date-picker
                v-model="logSearchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 280px"
              />
            </el-form-item>
            <el-form-item label="操作类型">
              <el-select
                v-model="logSearchForm.actionType"
                placeholder="全部"
                clearable
                style="width: 140px"
              >
                <el-option label="创建" value="create" />
                <el-option label="更新" value="update" />
                <el-option label="删除" value="delete" />
                <el-option label="借阅" value="borrow" />
                <el-option label="归还" value="return" />
                <el-option label="登录" value="login" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleLogSearch">搜索</el-button>
              <el-button :icon="Refresh" @click="handleLogReset">重置</el-button>
            </el-form-item>
          </el-form>

          <!-- 日志操作 -->
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button type="danger" plain :icon="Delete" @click="handleClearLogs">清空日志</el-button>
            </el-col>
          </el-row>

          <!-- 日志表格 -->
          <el-table
            :data="paginatedLogs"
            border
            style="width: 100%"
          >
            <el-table-column prop="id" label="编号" width="100" show-overflow-tooltip />
            <el-table-column prop="operator" label="操作人" width="120" align="center" />
            <el-table-column prop="actionType" label="操作类型" width="100" align="center">
              <template #default="{ row }">
                <el-tag
                  :type="actionTypeTag(row.actionType)"
                  size="small"
                >
                  {{ actionTypeLabel(row.actionType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="targetType" label="操作对象" width="100" align="center">
              <template #default="{ row }">
                {{ targetTypeLabel(row.targetType) }}
              </template>
            </el-table-column>
            <el-table-column prop="description" label="操作描述" min-width="220" show-overflow-tooltip />
            <el-table-column prop="createdAt" label="操作时间" width="180" align="center">
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>

          <!-- 日志分页 -->
          <pagination
            v-show="filteredLogsTotal > 0"
            :total="filteredLogsTotal"
            v-model="logCurrentPage"
            v-model:page-size="logPageSize"
            @change="handleLogPagination"
          />
        </el-tab-pane>

        <!-- ==================== Tab 3: 数据管理 ==================== -->
        <el-tab-pane label="数据管理" name="data">
          <div class="data-warning">
            <el-alert
              title="警告"
              type="warning"
              description="重置数据将清除所有本地存储数据（包括用户、图书、借阅记录、采购记录、操作日志等），并用初始 Mock 数据重新填充。"
              :closable="false"
              show-icon
            />
          </div>
          <div class="data-action">
            <el-button type="danger" size="large" @click="handleResetData">
              <el-icon><RefreshRight /></el-icon>
              重置数据
            </el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Refresh, Delete, RefreshRight } from '@element-plus/icons-vue'
import { useConfigStore } from '@/stores/config'
import { useLogStore } from '@/stores/log'
import { useBookStore } from '@/stores/book'
import { useUserStore } from '@/stores/user'
import { useBorrowStore } from '@/stores/borrow'
import { usePurchaseStore } from '@/stores/purchase'
import { formatDateTime } from '@/utils/id'
import { encodePassword, STORAGE_KEYS } from '@/utils/storage'
import { setBooks } from '@/utils/storage'
import { setUsers } from '@/utils/storage'
import { setBorrows } from '@/utils/storage'
import { setPurchases } from '@/utils/storage'
import { setLogs } from '@/utils/storage'
import { setConfig } from '@/utils/storage'
import { mockBooks } from '@/mock/books'
import { mockUsers } from '@/mock/users'
import { mockBorrows } from '@/mock/borrows'
import { mockPurchases } from '@/mock/purchases'
import { ElMessage, ElMessageBox } from 'element-plus'

const configStore = useConfigStore()
const logStore = useLogStore()
const bookStore = useBookStore()
const userStore = useUserStore()
const borrowStore = useBorrowStore()
const purchaseStore = usePurchaseStore()

// ========== Tab 状态 ==========
const activeTab = ref('settings')

// ==================== Tab 1: 系统设置 ====================
const settingsFormRef = ref(null)
const settingsLoading = ref(false)

const settingsForm = reactive({
  borrowDays: 30,
  pageSize: 10,
  enableCaptcha: true,
  adminPassword: ''
})

const settingsRules = {
  adminPassword: [
    {
      validator: (rule, value, callback) => {
        if (value && value.length < 6) {
          callback(new Error('密码长度不能少于6位'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

function loadSettings() {
  const config = configStore.config
  settingsForm.borrowDays = config.borrowDays ?? 30
  settingsForm.pageSize = config.pageSize ?? 10
  settingsForm.enableCaptcha = config.enableCaptcha ?? true
  settingsForm.adminPassword = ''
}

async function handleSaveSettings() {
  const valid = await settingsFormRef.value.validate().catch(() => false)
  if (!valid) return

  settingsLoading.value = true
  try {
    const updateData = {
      borrowDays: settingsForm.borrowDays,
      pageSize: settingsForm.pageSize,
      enableCaptcha: settingsForm.enableCaptcha
    }

    // 密码处理：如果填写了新密码，则 Base64 编码后保存
    if (settingsForm.adminPassword) {
      updateData.adminPassword = encodePassword(settingsForm.adminPassword)
    }

    configStore.updateConfig(updateData)
    settingsForm.adminPassword = ''
    ElMessage.success('系统设置保存成功')
  } finally {
    settingsLoading.value = false
  }
}

function handleResetSettings() {
  ElMessageBox.confirm(
    '确认恢复默认设置？',
    '操作确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    configStore.resetConfig()
    loadSettings()
    ElMessage.success('已恢复默认设置')
  }).catch(() => {})
}

// ==================== Tab 2: 操作日志 ====================
const logSearchForm = reactive({
  dateRange: null,
  actionType: ''
})

const logCurrentPage = ref(1)
const logPageSize = ref(10)

const filteredLogs = computed(() => {
  let result = [...logStore.logs]

  if (logSearchForm.actionType) {
    result = result.filter(log => log.actionType === logSearchForm.actionType)
  }

  if (logSearchForm.dateRange && logSearchForm.dateRange.length === 2) {
    const [start, end] = logSearchForm.dateRange
    const startDate = new Date(start + 'T00:00:00')
    const endDate = new Date(end + 'T23:59:59')
    result = result.filter(log => {
      const logDate = new Date(log.createdAt)
      return logDate >= startDate && logDate <= endDate
    })
  }

  return result
})

const filteredLogsTotal = computed(() => filteredLogs.value.length)

const paginatedLogs = computed(() => {
  const start = (logCurrentPage.value - 1) * logPageSize.value
  const end = start + logPageSize.value
  return filteredLogs.value.slice(start, end)
})

function handleLogSearch() {
  logCurrentPage.value = 1
}

function handleLogReset() {
  logSearchForm.dateRange = null
  logSearchForm.actionType = ''
  logCurrentPage.value = 1
}

function handleLogPagination({ page, pageSize: size }) {
  logCurrentPage.value = page
  logPageSize.value = size
}

function handleClearLogs() {
  ElMessageBox.confirm(
    '确认清空所有操作日志？此操作不可恢复。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    logStore.clearLogs()
    ElMessage.success('操作日志已清空')
  }).catch(() => {})
}

function actionTypeTag(type) {
  const map = {
    create: '',
    update: 'warning',
    delete: 'danger',
    borrow: 'success',
    return: 'info',
    login: ''
  }
  return map[type] || ''
}

function actionTypeLabel(type) {
  const map = {
    create: '创建',
    update: '更新',
    delete: '删除',
    borrow: '借阅',
    return: '归还',
    login: '登录'
  }
  return map[type] || type
}

function targetTypeLabel(type) {
  const map = {
    book: '图书',
    user: '用户',
    borrow: '借阅',
    purchase: '采购',
    system: '系统'
  }
  return map[type] || type
}

// ==================== Tab 3: 数据管理 ====================
function handleResetData() {
  ElMessageBox.confirm(
    '重置数据将清除所有本地数据并用初始数据重新填充，此操作不可恢复。确认继续？',
    '严重警告',
    {
      confirmButtonText: '确定重置',
      cancelButtonText: '取消',
      type: 'error',
      distinguishCancelAndClose: true
    }
  ).then(() => {
    try {
      // 1. 清除所有 localStorage 数据
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })

      // 2. 写入 Mock 数据
      setBooks(mockBooks)
      setUsers(mockUsers)
      setBorrows(mockBorrows)
      setPurchases(mockPurchases)
      setLogs([])

      // 3. 恢复默认配置
      const defaultConfig = {
        borrowDays: 30,
        pageSize: 10,
        enableCaptcha: true,
        adminPassword: 'YWRtaW4xMjM='
      }
      setConfig(defaultConfig)

      // 4. 刷新所有 Store
      bookStore.fetchBooks()
      userStore.fetchUsers()
      borrowStore.fetchBorrows()
      purchaseStore.fetchPurchases()
      logStore.fetchLogs()
      configStore.fetchConfig()

      // 5. 重新加载设置表单
      loadSettings()

      ElMessage.success('数据已重置成功')
    } catch (e) {
      ElMessage.error('数据已重置失败：' + e.message)
    }
  }).catch(() => {})
}

// ========== 初始化 ==========
onMounted(() => {
  configStore.fetchConfig()
  logStore.fetchLogs()
  loadSettings()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.system-container {
  background: #fff;
  padding: 20px 24px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  border: 1px solid #ebeef5;
}

.form-tip {
  margin-left: 8px;
  color: #909399;
  font-size: 14px;
}

.mb8 {
  margin-bottom: 12px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

.data-warning {
  margin-bottom: 24px;
}

.data-action {
  text-align: center;
  padding: 24px 0;
}
</style>