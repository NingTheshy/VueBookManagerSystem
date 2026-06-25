<template>
  <div class="borrow-info-page">
    <AppHeader />
    <div class="page-body">
      <main class="main-content">
        <!-- 状态筛选 -->
        <div class="filter-box">
          <el-form :inline="true" :model="filterForm" class="filter-form">
            <el-form-item label="借阅状态">
              <el-select v-model="statusFilter" placeholder="全部" style="width: 160px">
                <el-option label="全部" value="" />
                <el-option label="借阅中" value="borrowing" />
                <el-option label="已过期" value="overdue" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <!-- 借阅列表 -->
        <div class="table-box">
          <el-table
            :data="pagedBorrows"
            v-loading="borrowStore.loading"
            border
            stripe
            style="width: 100%"
            :header-cell-style="{ background: '#fafafa', color: '#303133', fontWeight: 'bold' }"
            :row-class-name="tableRowClassName"
          >
            <el-table-column prop="bookNo" label="图书号" min-width="140" align="center" />
            <el-table-column prop="bookName" label="图书名称" min-width="180" show-overflow-tooltip />
            <el-table-column prop="userAccount" label="读者账号" min-width="120" align="center" />
            <el-table-column prop="userName" label="读者姓名" min-width="120" align="center" />
            <el-table-column label="借阅日期" min-width="130" align="center">
              <template #default="{ row }">
                {{ formatDate(row.borrowDate) }}
              </template>
            </el-table-column>
            <el-table-column label="截止还书日期" min-width="140" align="center">
              <template #default="{ row }">
                {{ formatDate(row.dueDate) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="warning"
                  size="small"
                  :disabled="row.status === 'returned'"
                  @click="handleReturn(row)"
                >
                  还书
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredBorrows.length"
            layout="total, sizes, prev, pager, next, jumper"
            background
            class="table-pagination"
          />
        </div>
      </main>

      <AppSidebar>
        <template #hotBooks>
          <ol class="rank-list">
            <li v-for="(book, index) in bookStore.hotBooks" :key="book.id" class="rank-item">
              <span class="rank-index" :class="getRankClass(index)">{{ index + 1 }}</span>
              <span class="rank-name">{{ book.name }}</span>
              <span class="rank-count">{{ book.borrowCount }} 次借阅</span>
            </li>
            <li v-if="bookStore.hotBooks.length === 0" class="rank-empty">暂无数据</li>
          </ol>
        </template>
        <template #bestReaders>
          <ol class="rank-list">
            <li v-for="(user, index) in userStore.bestReaders" :key="user.id" class="rank-item">
              <span class="rank-index" :class="getRankClass(index)">{{ index + 1 }}</span>
              <span class="rank-name">{{ user.username }}</span>
              <span class="rank-count">{{ user.borrowCount }} 次借阅</span>
            </li>
            <li v-if="userStore.bestReaders.length === 0" class="rank-empty">暂无数据</li>
          </ol>
        </template>
        <template #feedback>
          <div class="feedback-form">
            <el-input
              v-model="feedbackText"
              type="textarea"
              :rows="4"
              placeholder="请输入您的反馈意见..."
            />
            <el-button
              type="primary"
              style="margin-top: 12px; width: 100%"
              @click="handleFeedback"
            >
              提交反馈
            </el-button>
          </div>
        </template>
      </AppSidebar>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AppHeader from '@/components/common/AppHeader.vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import { useBorrowStore } from '@/stores/borrow'
import { useBookStore } from '@/stores/book'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/utils/id'

const borrowStore = useBorrowStore()
const bookStore = useBookStore()
const userStore = useUserStore()
const authStore = useAuthStore()

// 状态筛选
const statusFilter = ref('')
const filterForm = ref({})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 反馈
const feedbackText = ref('')

// 排行样式
function getRankClass(index) {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return ''
}

// 当前用户借阅记录 + 状态筛选
const filteredBorrows = computed(() => {
  let list = borrowStore.currentUserBorrows
  if (statusFilter.value) {
    list = list.filter(b => {
      if (statusFilter.value === 'overdue') {
        // 已过期：status 为 overdue，或 borrowing 但已过截止日期
        return b.status === 'overdue' ||
          (b.status === 'borrowing' && new Date(b.dueDate) < new Date())
      }
      return b.status === statusFilter.value
    })
  }
  return list
})

// 分页后的数据
const pagedBorrows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredBorrows.value.slice(start, start + pageSize.value)
})

// 表格行样式 - 过期行标红
function tableRowClassName({ row }) {
  if (row.status === 'returned') return ''
  const isOverdue = row.status === 'overdue' ||
    (row.status === 'borrowing' && new Date(row.dueDate) < new Date())
  return isOverdue ? 'overdue-row' : ''
}

// 还书
function handleReturn(row) {
  ElMessageBox.confirm(
    `确认归还《${row.bookName}》吗？`,
    '还书确认',
    {
      confirmButtonText: '确认归还',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    borrowStore.returnBook(row.id)
    bookStore.decrementBorrowCount(row.bookId)

    // 更新用户借阅数量
    const currentUser = authStore.currentUser
    if (currentUser && currentUser.borrowCount > 0) {
      userStore.updateUser(currentUser.id, {
        borrowCount: currentUser.borrowCount - 1
      })
    }

    // 刷新数据
    borrowStore.fetchBorrows()
    bookStore.fetchBooks()
    userStore.fetchUsers()

    ElMessage.success(`归还《${row.bookName}》成功！`)
  }).catch(() => {
    // 取消操作
  })
}

// 反馈
function handleFeedback() {
  const text = feedbackText.value.trim()
  if (!text) {
    ElMessage.warning('请输入反馈内容')
    return
  }

  try {
    const raw = localStorage.getItem('bms_feedbacks')
    const feedbacks = raw ? JSON.parse(raw) : []
    feedbacks.push({
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      content: text,
      userId: authStore.currentUser?.id || '',
      username: authStore.currentUser?.username || '匿名',
      createdAt: new Date().toISOString()
    })
    localStorage.setItem('bms_feedbacks', JSON.stringify(feedbacks))
    feedbackText.value = ''
    ElMessage.success('感谢您的反馈！')
  } catch {
    ElMessage.error('提交失败，请重试')
  }
}

onMounted(() => {
  borrowStore.fetchBorrows()
  bookStore.fetchBooks()
  userStore.fetchUsers()
})
</script>

<style scoped>
.borrow-info-page {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.page-body {
  display: flex;
  min-height: calc(100vh - 60px);
}

.main-content {
  flex: 1;
  padding: 20px;
  min-width: 0;
}

/* Filter card */
.filter-box {
  background: #fff;
  padding: 20px 20px 8px;
  border-radius: 6px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  border: 1px solid #ebeef5;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

/* Table card */
.table-box {
  background: #fff;
  padding: 16px 20px 4px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  border: 1px solid #ebeef5;
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

/* Overdue row */
:deep(.overdue-row) {
  background-color: #fef0f0 !important;
}

:deep(.overdue-row) td {
  color: #f56c6c !important;
}

/* Rank list */
.rank-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f2f5;
  transition: all 0.2s;
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-item:hover {
  padding-left: 4px;
}

.rank-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-right: 10px;
  border-radius: 6px;
  background: #c0c4cc;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.rank-gold {
  background: linear-gradient(135deg, #f56c6c, #e6a23c);
}

.rank-silver {
  background: linear-gradient(135deg, #909399, #b0b4bb);
}

.rank-bronze {
  background: linear-gradient(135deg, #cd7f32, #e6a23c);
}

.rank-name {
  flex: 1;
  font-size: 13px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-count {
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
  margin-left: 8px;
}

.rank-empty {
  text-align: center;
  color: #c0c4cc;
  font-size: 13px;
  padding: 16px 0;
}

.feedback-form {
  display: flex;
  flex-direction: column;
}
</style>