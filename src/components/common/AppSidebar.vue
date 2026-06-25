<template>
  <aside class="app-sidebar">
    <div class="sidebar-section">
      <h3 class="section-title">热门推荐</h3>
      <div class="section-content">
        <!-- 由父组件通过 slot 传入具体内容 -->
        <slot name="hotBooks" />
      </div>
    </div>
    <div class="sidebar-section">
      <h3 class="section-title">最佳读者</h3>
      <div class="section-content">
        <slot name="bestReaders" />
      </div>
    </div>
    <div class="sidebar-section">
      <h3 class="section-title">问题反馈</h3>
      <div class="section-content">
        <slot name="feedback" />
      </div>
    </div>
  </aside>
</template>

<script setup>
// 侧边栏容器组件，通过插槽接收具体内容
</script>

<style scoped>
.app-sidebar {
  width: 300px;
  padding: 20px 16px;
  background-color: #fff;
  border-left: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: calc(100vh - 60px);
}

.sidebar-section {
  background: #fafcfe;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.2s;
}

.sidebar-section:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 30px;
  height: 2px;
  background: #409eff;
  border-radius: 1px;
}

.section-content {
  min-height: 40px;
}
</style>