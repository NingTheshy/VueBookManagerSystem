<template>
  <div class="login-wrapper">
    <!-- Floating decorative circles -->
    <div class="deco-circle deco-circle-1"></div>
    <div class="deco-circle deco-circle-2"></div>
    <div class="deco-circle deco-circle-3"></div>
    <div class="deco-circle deco-circle-4"></div>

    <div class="login-container">
      <div class="login-card">
        <div class="login-card-accent"></div>
        <!-- 系统标题 -->
        <div class="login-header">
          <div class="login-logo">
            <el-icon :size="42" class="logo-icon">
              <Reading />
            </el-icon>
          </div>
          <h3 class="login-title">图书管理系统</h3>
          <p class="login-subtitle">Knowledge is power</p>
        </div>

        <!-- 登录表单 -->
        <el-tabs v-model="activeTab" class="login-tabs">
          <el-tab-pane label="账号登录" name="account">
            <el-form
              ref="loginFormRef"
              :model="loginForm"
              :rules="loginRules"
              size="large"
              @keyup.enter="handleLogin"
            >
              <el-form-item prop="username">
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入账号"
                  :prefix-icon="User"
                  clearable
                />
              </el-form-item>

              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  :prefix-icon="Lock"
                  show-password
                  clearable
                />
              </el-form-item>

              <el-form-item v-if="enableCaptcha" prop="captcha">
                <div class="captcha-row">
                  <el-input
                    v-model="loginForm.captcha"
                    placeholder="请输入验证码"
                    :prefix-icon="Key"
                    class="captcha-input"
                  />
                  <div class="captcha-display" @click="refreshCaptcha" title="点击刷新验证码">
                    <span class="captcha-text">{{ captchaCode }}</span>
                  </div>
                </div>
              </el-form-item>

              <el-form-item>
                <el-checkbox v-model="rememberMe" label="记住密码" size="small" />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  class="login-btn"
                  :loading="loading"
                  @click="handleLogin"
                >
                  {{ loading ? '登录中...' : '登 录' }}
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>

        <!-- 底部链接 -->
        <div class="login-footer">
          <el-link type="primary" :underline="false" @click="showRegisterDialog = true">
            没有账号？立即注册
          </el-link>
          <span class="footer-divider">|</span>
          <el-link type="success" :underline="false" href="/admin/login">
            管理员登录
          </el-link>
        </div>
      </div>

      <!-- 页脚 -->
      <div class="login-copyright">
        Copyright © {{ new Date().getFullYear() }} 图书管理系统
      </div>
    </div>

    <!-- 底部装饰波浪 -->
    <svg class="login-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
      <path fill="rgba(64, 158, 255, 0.06)" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,213.3C960,192,1056,160,1152,149.3C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
    </svg>

    <!-- 注册对话框 -->
    <el-dialog
      v-model="showRegisterDialog"
      title="用户注册"
      width="420px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号"
            clearable
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showRegisterDialog = false">取 消</el-button>
          <el-button type="primary" :loading="registerLoading" @click="handleRegister">
            注 册
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Key, Reading } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useConfigStore } from '@/stores/config'

const router = useRouter()
const route = useRoute()

// 初始化状态管理实例
const authStore = useAuthStore()    // 认证状态（登录/登出/当前用户）
const userStore = useUserStore()    // 用户数据（用户列表/登录验证/注册）
const configStore = useConfigStore() // 系统配置（验证码开关等）

// ========== 验证码机制 ==========
/**
 * 验证码功能说明：
 * 1. 是否启用由系统配置决定（config.enableCaptcha）
 * 2. 每次生成4位随机数字验证码
 * 3. 用户点击验证码区域可刷新
 * 4. 登录失败后自动刷新验证码（防止暴力破解）
 * 5. 验证码校验通过后才允许提交登录请求
 */
const enableCaptcha = computed(() => configStore.config.value?.enableCaptcha ?? true)

// 生成4位随机数字验证码（范围：1000-9999）
function generateCaptcha() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

const captchaCode = ref('')
// 刷新验证码（页面初始化和登录失败时调用）
function refreshCaptcha() {
  captchaCode.value = generateCaptcha()
}

// ========== 登录表单与验证 ==========
const activeTab = ref('account')
const loginFormRef = ref(null)    // 表单引用，用于手动触发验证
const loading = ref(false)        // 登录按钮加载状态
const rememberMe = ref(false)     // 记住密码（读者端暂未实现持久化）

const loginForm = reactive({
  username: '',
  password: '',
  captcha: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    // 自定义验证器：校验用户输入的验证码与生成的验证码是否一致
    {
      validator: (_rule, value, callback) => {
        if (value && value !== captchaCode.value) {
          callback(new Error('验证码错误'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

/**
 * 登录处理流程：
 * 1. 表单验证（用户名、密码、验证码）
 * 2. 调用 userStore.login() 进行用户身份验证（密码比对）
 * 3. 验证成功 → 调用 authStore.setCurrentUser() 设置登录状态
 * 4. 根据路由参数跳转（优先 redirect，否则跳转到图书查询页）
 * 5. 验证失败 → 提示错误并刷新验证码
 */
async function handleLogin() {
  if (!loginFormRef.value) return

  // 步骤1：表单验证（Element-Plus 表单验证）
  try {
    await loginFormRef.value.validate()
  } catch {
    return // 验证失败，终止登录流程
  }

  loading.value = true
  try {
    // 步骤2：调用 userStore.login() 验证账号密码（角色限定为 'user'）
    const user = userStore.login(loginForm.username, loginForm.password, 'user')
    
    if (user) {
      // 步骤3：验证成功，设置登录状态（持久化到 localStorage）
      authStore.setCurrentUser(user)
      ElMessage.success('登录成功')

      // 步骤4：跳转页面（支持 redirect 参数，默认跳转到图书查询页）
      const redirect = route.query.redirect
      router.push(redirect || '/book-query')
    } else {
      // 步骤5：验证失败（账号不存在或密码错误）
      ElMessage.error('账号或密码错误')
      refreshCaptcha() // 刷新验证码，防止暴力破解
    }
  } catch (err) {
    ElMessage.error('登录失败，请重试')
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

// ========== 注册对话框 ==========
const showRegisterDialog = ref(false)
const registerFormRef = ref(null)
const registerLoading = ref(false)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: ''
})

// 自定义验证器：确认密码与密码是否一致
const validateConfirmPassword = (_rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

/**
 * 用户注册流程：
 * 1. 表单验证（用户名、密码、确认密码、手机号）
 * 2. 调用 userStore.register() 创建用户（自动检测用户名是否重复）
 * 3. 注册成功 → 设置登录状态并自动跳转
 * 4. 注册失败（用户名已存在）→ 提示错误
 */
async function handleRegister() {
  if (!registerFormRef.value) return

  try {
    await registerFormRef.value.validate()
  } catch {
    return
  }

  registerLoading.value = true
  try {
    const user = userStore.register({
      username: registerForm.username,
      password: registerForm.password,
      phone: registerForm.phone
    })

    if (user) {
      // 注册成功，自动登录并跳转
      authStore.setCurrentUser(user)
      ElMessage.success('注册成功，已自动登录')
      showRegisterDialog.value = false
      router.push('/book-query')
    } else {
      // 用户名已存在
      ElMessage.error('用户名已存在，请更换')
    }
  } catch (err) {
    ElMessage.error('注册失败，请重试')
  } finally {
    registerLoading.value = false
  }
}

// ========== 初始化 ==========
/**
 * 页面初始化逻辑：
 * 1. 加载用户列表（用于登录验证和注册检测）
 * 2. 加载系统配置（用于控制验证码开关）
 * 3. 生成初始验证码
 */
onMounted(() => {
  userStore.fetchUsers()   // 加载用户数据
  configStore.fetchConfig() // 加载系统配置
  refreshCaptcha()         // 生成初始验证码
})
</script>

<style scoped>
/* ================================================================
   Login — Premium RuoYi-Style User Login
   ================================================================ */
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg-page);
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(64, 158, 255, 0.07) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 20%, rgba(64, 158, 255, 0.05) 0%, transparent 55%),
    radial-gradient(ellipse at 60% 80%, rgba(103, 194, 58, 0.04) 0%, transparent 45%);
  position: relative;
  overflow: hidden;
}

/* ========== Floating decorative circles ========== */
.deco-circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  animation: floatCircle 8s ease-in-out infinite;
}

.deco-circle-1 {
  width: 260px;
  height: 260px;
  top: -80px;
  left: -60px;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.08) 0%, transparent 70%);
  animation-delay: 0s;
}

.deco-circle-2 {
  width: 200px;
  height: 200px;
  bottom: -40px;
  right: -40px;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.06) 0%, transparent 70%);
  animation-delay: -3s;
}

.deco-circle-3 {
  width: 160px;
  height: 160px;
  top: 40%;
  right: 10%;
  background: radial-gradient(circle, rgba(103, 194, 58, 0.05) 0%, transparent 70%);
  animation-delay: -5s;
}

.deco-circle-4 {
  width: 120px;
  height: 120px;
  bottom: 25%;
  left: 8%;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.06) 0%, transparent 70%);
  animation-delay: -2s;
}

@keyframes floatCircle {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  25% {
    transform: translateY(-15px) scale(1.03);
  }
  50% {
    transform: translateY(-5px) scale(0.97);
  }
  75% {
    transform: translateY(-20px) scale(1.02);
  }
}

/* ========== Container ========== */
.login-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

/* ========== Card ========== */
.login-card {
  width: 420px;
  padding: 0 40px 32px;
  background: #fff;
  border-radius: 12px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.06),
    0 8px 40px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.login-card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light), var(--color-primary));
}

/* ========== Header ========== */
.login-header {
  text-align: center;
  padding: 36px 0 8px;
}

.login-logo {
  margin-bottom: 14px;
}

.logo-icon {
  color: var(--color-primary);
  filter: drop-shadow(0 2px 6px rgba(64, 158, 255, 0.25));
}

.login-title {
  font-size: 22px;
  color: var(--text-primary);
  margin: 0 0 6px 0;
  font-weight: 500;
  letter-spacing: 3px;
}

.login-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  letter-spacing: 1px;
  font-style: italic;
}

/* ========== Tabs ========== */
.login-tabs {
  margin-bottom: 4px;
}

.login-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

.login-tabs :deep(.el-tabs__header) {
  margin-bottom: 18px;
}

.login-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
}

.login-tabs :deep(.el-tabs__active-bar) {
  border-radius: 2px;
}

/* ========== Input focus glow ========== */
.login-tabs :deep(.el-input__wrapper) {
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.login-tabs :deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--color-primary) inset, 0 0 0 3px rgba(64, 158, 255, 0.1);
}

/* ========== Captcha ========== */
.captcha-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-input {
  flex: 1;
}

.captcha-display {
  width: 120px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafbfc;
  border: 2px dashed var(--border-base);
  border-radius: var(--radius-md);
  cursor: pointer;
  user-select: none;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  overflow: hidden;
}

.captcha-display:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-lightest);
  border-style: solid;
}

.captcha-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 5px;
  font-family: var(--font-family-code);
  text-shadow: 0 1px 2px rgba(64, 158, 255, 0.15);
}

/* ========== Login button ========== */
.login-btn {
  width: 100%;
  height: 42px;
  font-size: 15px;
  letter-spacing: 6px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.login-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 14px rgba(64, 158, 255, 0.35);
}

.login-btn:active {
  transform: scale(0.98);
}

.login-btn :deep(span) {
  font-weight: 500;
}

/* ========== Footer links ========== */
.login-footer {
  text-align: center;
  margin-top: 4px;
  padding-top: 18px;
  border-top: 1px solid var(--border-lighter);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.footer-divider {
  margin: 0 10px;
  color: var(--text-placeholder);
  font-size: 12px;
}

.login-footer :deep(.el-link) {
  font-size: 13px;
}

/* ========== Copyright ========== */
.login-copyright {
  margin-top: 28px;
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

/* ========== Dialog ========== */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* ========== Wave ========== */
.login-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  pointer-events: none;
  z-index: 0;
}
</style>