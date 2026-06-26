<template>
  <div class="admin-login-wrapper">
    <!-- Animated particles background -->
    <div class="admin-particles">
      <span class="particle particle-1"></span>
      <span class="particle particle-2"></span>
      <span class="particle particle-3"></span>
      <span class="particle particle-4"></span>
      <span class="particle particle-5"></span>
      <span class="particle particle-6"></span>
      <span class="particle particle-7"></span>
      <span class="particle particle-8"></span>
    </div>

    <!-- Glow spots -->
    <div class="glow-spot glow-spot-1"></div>
    <div class="glow-spot glow-spot-2"></div>

    <div class="admin-login-container">
      <div class="admin-login-card">
        <div class="admin-card-glow"></div>
        <!-- 系统标题 -->
        <div class="admin-login-header">
          <div class="admin-login-logo">
            <el-icon :size="46" class="admin-logo-icon">
              <Reading />
            </el-icon>
          </div>
          <h3 class="admin-login-title">
            <span class="admin-shield-icon">&#x1f6e1;</span>
            图书管理系统
          </h3>
          <p class="admin-login-subtitle">后台管理登录</p>
        </div>

        <!-- 登录表单 -->
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
              placeholder="请输入管理员账号"
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

          <el-form-item>
            <div class="admin-login-extra">
              <el-checkbox v-model="rememberMe" label="记住密码" size="small" />
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="admin-login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 底部链接 -->
        <div class="admin-login-footer">
          <el-link type="primary" :underline="false" @click="$router.push('/login')">
            返回读者登录
          </el-link>
        </div>
      </div>

      <!-- 页脚 -->
      <div class="admin-login-copyright">
        Copyright © {{ new Date().getFullYear() }} 图书管理系统
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Reading } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useConfigStore } from '@/stores/config'
import { encodePassword, decodePassword } from '@/utils/storage'

const router = useRouter()
const route = useRoute()

// 初始化状态管理实例
const authStore = useAuthStore()    // 认证状态（当前用户、记住密码）
const userStore = useUserStore()    // 用户数据（用户列表/登录验证）
const configStore = useConfigStore() // 系统配置（默认管理员密码等）

// ========== 表单 ==========
const loginFormRef = ref(null)    // 表单引用，用于手动触发验证
const loading = ref(false)        // 登录按钮加载状态
const rememberMe = ref(false)     // 记住密码开关

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

/**
 * 管理员登录处理流程（双认证链）：
 * 
 * 认证链1（主认证）：用户表认证
 *   - 调用 userStore.login() 查找用户表中 role='admin' 的用户
 *   - 比对用户名和密码（Base64编码存储）
 * 
 * 认证链2（回退认证）：默认管理员认证
 *   - 若用户表中未找到匹配的管理员
 *   - 读取系统配置中的默认管理员密码（config.adminPassword）
 *   - 解码后与输入密码比对
 *   - 仅支持 username='admin' 的登录
 * 
 * 设计意图：
 *   - 默认管理员始终可用，防止所有管理员账户被删除后无法登录
 *   - 系统配置中的密码采用 Base64 编码存储，避免明文暴露
 * 
 * 记住密码功能：
 *   - 用户勾选"记住密码"后，密码以 Base64 编码形式存储在 localStorage
 *   - 下次登录时自动解码并预填充表单
 */
async function handleLogin() {
  if (!loginFormRef.value) return

  // 步骤1：表单验证
  try {
    await loginFormRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    // ========== 认证链1：用户表认证 ==========
    // 在用户列表中查找 role='admin' 的匹配用户
    let user = userStore.login(loginForm.username, loginForm.password, 'admin')

    // ========== 认证链2：回退认证（默认管理员） ==========
    // 若用户表中无匹配管理员，则尝试系统配置的默认管理员账户
    if (!user) {
      // 从系统配置中读取默认管理员密码并解码（Base64解码）
      const decodedAdminPwd = decodePassword(configStore.config.value.adminPassword)
      // 仅允许 username='admin' 的默认管理员登录
      if (loginForm.username === 'admin' && loginForm.password === decodedAdminPwd) {
        // 构造管理员用户对象（默认管理员不在用户表中）
        user = {
          id: 'admin',
          username: 'admin',
          role: 'admin'
        }
      }
    }

    // ========== 登录成功处理 ==========
    if (user) {
      // 设置登录状态（持久化到 localStorage）
      authStore.setCurrentUser(user)

      // 记住密码处理
      if (rememberMe.value) {
        // 密码以 Base64 编码形式存储（防止明文存储）
        authStore.rememberAdmin(loginForm.username, encodePassword(loginForm.password))
        ElMessage.success('登录成功，密码已保存')
      } else {
        // 清除之前保存的密码
        authStore.clearRememberedAdmin()
        ElMessage.success('登录成功')
      }

      // 跳转页面（支持 redirect 参数，默认跳转到用户管理页）
      const redirect = route.query.redirect
      router.push(redirect || '/admin/user-manage')
    } else {
      // 两条认证链均失败
      ElMessage.error('账号或密码错误')
    }
  } catch (err) {
    ElMessage.error('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

// ========== 初始化 ==========
/**
 * 页面初始化逻辑：
 * 1. 加载用户列表（用于认证链1的用户验证）
 * 2. 加载系统配置（用于认证链2的默认管理员密码读取）
 * 3. 恢复记住的密码（若存在），自动填充表单
 */
onMounted(() => {
  userStore.fetchUsers()   // 加载用户数据
  configStore.fetchConfig() // 加载系统配置

  // 恢复记住的密码（Base64解码后填充）
  const remembered = authStore.rememberedAdmin
  if (remembered && remembered.username) {
    loginForm.username = remembered.username
    loginForm.password = decodePassword(remembered.password)
    rememberMe.value = true
  }
})
</script>

<style scoped>
/* ================================================================
   AdminLogin — Premium RuoYi-Style Admin Login (Dark Theme)
   ================================================================ */
.admin-login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1628 0%, #162447 40%, #0f1d38 100%);
  position: relative;
  overflow: hidden;
}

/* ========== Animated particles / stars ========== */
.admin-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(64, 158, 255, 0.5);
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
}

.particle-1 { top: 10%; left: 15%; animation-delay: 0s; width: 3px; height: 3px; }
.particle-2 { top: 20%; right: 20%; animation-delay: -0.5s; }
.particle-3 { top: 35%; left: 8%; animation-delay: -1s; width: 2.5px; height: 2.5px; }
.particle-4 { top: 50%; right: 12%; animation-delay: -1.5s; }
.particle-5 { bottom: 25%; left: 22%; animation-delay: -2s; width: 3px; height: 3px; }
.particle-6 { bottom: 15%; right: 25%; animation-delay: -0.7s; }
.particle-7 { top: 65%; left: 45%; animation-delay: -1.8s; width: 2px; height: 2px; }
.particle-8 { top: 45%; right: 35%; animation-delay: -2.3s; width: 2.5px; height: 2.5px; }

@keyframes twinkle {
  0%, 100% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.5);
  }
}

/* ========== Glow spots ========== */
.glow-spot {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.glow-spot-1 {
  width: 600px;
  height: 600px;
  top: -200px;
  left: -150px;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.08) 0%, transparent 70%);
  animation: glowPulse 6s ease-in-out infinite;
}

.glow-spot-2 {
  width: 450px;
  height: 450px;
  bottom: -100px;
  right: -100px;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.06) 0%, transparent 70%);
  animation: glowPulse 6s ease-in-out infinite;
  animation-delay: -3s;
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.12);
  }
}

/* ========== Container ========== */
.admin-login-container {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

/* ========== Card ========== */
.admin-login-card {
  position: relative;
  width: 420px;
  padding: 48px 40px 36px;
  background: rgba(255, 255, 255, 0.97);
  border-radius: 12px;
  box-shadow:
    0 4px 30px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(64, 158, 255, 0.1),
    0 0 60px rgba(64, 158, 255, 0.08);
  backdrop-filter: blur(8px);
  overflow: hidden;
}

.admin-card-glow {
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(64, 158, 255, 0.4) 20%,
    rgba(64, 158, 255, 0.7) 50%,
    rgba(64, 158, 255, 0.4) 80%,
    transparent 100%
  );
}

/* ========== Header ========== */
.admin-login-header {
  text-align: center;
  margin-bottom: 30px;
}

.admin-login-logo {
  margin-bottom: 14px;
}

.admin-logo-icon {
  color: var(--color-primary);
  filter: drop-shadow(0 2px 8px rgba(64, 158, 255, 0.3));
}

.admin-login-title {
  font-size: 22px;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  font-weight: 600;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.admin-shield-icon {
  font-size: 20px;
  display: inline-block;
  filter: grayscale(0.3);
}

.admin-login-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  letter-spacing: 1.5px;
  font-weight: 400;
}

/* ========== Form inputs ========== */
.admin-login-card :deep(.el-input__wrapper) {
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  background: #fafbfc;
}

.admin-login-card :deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--color-primary) inset, 0 0 0 3px rgba(64, 158, 255, 0.1);
  background: #fff;
}

.admin-login-extra {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

/* ========== Login button ========== */
.admin-login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  letter-spacing: 6px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.admin-login-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
  transition: opacity var(--transition-fast);
  opacity: 0;
}

.admin-login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
  animation: btnPulse 2s ease-in-out infinite;
}

.admin-login-btn:hover::after {
  opacity: 1;
}

.admin-login-btn:active {
  transform: translateY(0);
}

.admin-login-btn :deep(span) {
  font-weight: 500;
}

@keyframes btnPulse {
  0%, 100% {
    box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
  }
  50% {
    box-shadow: 0 6px 28px rgba(64, 158, 255, 0.55);
  }
}

/* ========== Footer ========== */
.admin-login-footer {
  text-align: center;
  margin-top: 4px;
  padding-top: 18px;
  border-top: 1px solid var(--border-lighter);
}

.admin-login-footer :deep(.el-link) {
  font-size: 13px;
}

/* ========== Copyright ========== */
.admin-login-copyright {
  margin-top: 30px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.42);
  letter-spacing: 0.5px;
}
</style>