<template>
  <div class="book-query-page">
    <AppHeader />
    <div class="page-body">
      <main class="main-content">
        <!-- 搜索筛选区 -->
        <div class="search-box">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.keyword"
                placeholder="搜索图书名称 / 作者"
                clearable
                style="width: 220px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="图书类型">
              <el-select
                v-model="searchForm.category"
                placeholder="全部类型"
                clearable
                style="width: 160px"
              >
                <el-option
                  v-for="cat in categoryOptions"
                  :key="cat"
                  :label="cat"
                  :value="cat"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="出版社">
              <el-input
                v-model="searchForm.publisher"
                placeholder="出版社名称"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleSearch">
                搜索
              </el-button>
              <el-button :icon="Refresh" @click="handleReset">
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 图书列表 -->
        <div class="table-box">
          <el-table
            :data="pagedBooks"
            v-loading="bookStore.loading"
            border
            stripe
            style="width: 100%"
            :header-cell-style="{ background: '#fafafa', color: '#303133', fontWeight: 'bold' }"
          >
            <el-table-column prop="bookNo" label="图书号" min-width="140" align="center" />
            <el-table-column prop="category" label="图书类型" min-width="100" align="center" />
            <el-table-column prop="name" label="图书名称" min-width="180" show-overflow-tooltip />
            <el-table-column prop="author" label="作者" min-width="140" show-overflow-tooltip />
            <el-table-column prop="publisher" label="出版社" min-width="160" show-overflow-tooltip />
            <el-table-column label="总数量" min-width="90" align="center">
              <template #default="{ row }">
                {{ row.totalCount }}
              </template>
            </el-table-column>
            <el-table-column label="可借数量" min-width="90" align="center">
              <template #default="{ row }">
                <span :class="{ 'text-danger': row.totalCount - row.borrowCount === 0 }">
                  {{ row.totalCount - row.borrowCount }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  :disabled="row.totalCount - row.borrowCount === 0"
                  @click="handleBorrow(row)"
                >
                  借阅
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredBooks.length"
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
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AppHeader from '@/components/common/AppHeader.vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import { useBookStore } from '@/stores/book'
import { useBorrowStore } from '@/stores/borrow'
import { useUserStore } from '@/stores/user'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/auth'

const bookStore = useBookStore()
const borrowStore = useBorrowStore()
const userStore = useUserStore()
const configStore = useConfigStore()
const authStore = useAuthStore()

// 搜索表单
const searchForm = ref({
  keyword: '',
  category: '',
  publisher: ''
})

// 图书类型选项
const categoryOptions = ['科技', '文学', '科幻', '历史', '教育']

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 过滤后的图书列表
const filteredBooks = computed(() => bookStore.filteredBooks)

// 分页后的图书
const pagedBooks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredBooks.value.slice(start, start + pageSize.value)
})

// 反馈
const feedbackText = ref('')

// 排行样式
function getRankClass(index) {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return ''
}

// 搜索
function handleSearch() {
  bookStore.updateFilters({
    keyword: searchForm.value.keyword,
    category: searchForm.value.category,
    publisher: searchForm.value.publisher
  })
  currentPage.value = 1
}

// 重置
function handleReset() {
  searchForm.value = { keyword: '', category: '', publisher: '' }
  bookStore.updateFilters({
    keyword: '',
    category: '',
    publisher: ''
  })
  currentPage.value = 1
}

// 借阅
function handleBorrow(book) {
  const availableCount = book.totalCount - book.borrowCount
  if (availableCount <= 0) {
    ElMessage.warning('该书已全部借出')
    return
  }

  const currentUser = authStore.currentUser
  if (!currentUser) {
    ElMessage.error('请先登录')
    return
  }

  bookStore.incrementBorrowCount(book.id)
  borrowStore.addBorrow(book, currentUser, configStore.config.borrowDays)

  // 更新用户借阅数量
  userStore.updateUser(currentUser.id, {
    borrowCount: (currentUser.borrowCount || 0) + 1
  })
  userStore.fetchUsers()

  ElMessage.success(`借阅《${book.name}》成功！`)
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
  bookStore.fetchBooks()
  borrowStore.fetchBorrows()
  userStore.fetchUsers()
})
</script>

<style scoped>
.book-query-page {
  min-height: 100vh;
  background: #f0f2f5;
}

.page-body {
  display: flex;
}

.main-content {
  flex: 1;
  padding: 20px;
  min-width: 0;
}

/* Search card */
.search-box {
  background: #fff;
  padding: 20px 20px 8px;
  border-radius: 6px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  border: 1px solid #ebeef5;
}

.search-form {
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

/* Feedback form */
.feedback-form {
  display: flex;
  flex-direction: column;
}

.text-danger {
  color: #f56c6c;
  font-weight: 600;
}
</style>