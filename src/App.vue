<template>
  <router-view />
</template>

<script setup>
// 根组件仅作为路由出口，不包含业务逻辑
</script>

<style>
/* ================================================================
   Global Design System — RuoYi-Inspired Modern Theme
   ================================================================ */
:root {
  /* --- Brand Colors --- */
  --color-primary: #409eff;
  --color-primary-light: #66b1ff;
  --color-primary-lighter: #a0cfff;
  --color-primary-lightest: #ecf5ff;
  --color-primary-dark: #3a8ee6;
  --color-success: #67c23a;
  --color-success-light: #e1f3d8;
  --color-warning: #e6a23c;
  --color-warning-light: #fdf6ec;
  --color-danger: #f56c6c;
  --color-danger-light: #fef0f0;
  --color-info: #909399;
  --color-info-light: #f4f4f5;

  /* --- Neutrals --- */
  --color-white: #ffffff;
  --color-black: #000000;
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --text-placeholder: #c0c4cc;
  --text-disabled: #c0c4cc;

  /* --- Borders --- */
  --border-base: #dcdfe6;
  --border-light: #e4e7ed;
  --border-lighter: #ebeef5;
  --border-extra-light: #f2f6fc;

  /* --- Backgrounds --- */
  --bg-page: #f0f2f5;
  --bg-container: #ffffff;
  --bg-hover: #f5f7fa;
  --bg-stripe: #fafafa;
  --bg-sidebar: #304156;
  --bg-sidebar-sub: #1f2d3d;

  /* --- Layout Tokens --- */
  --sidebar-width: 220px;
  --sidebar-collapsed-width: 64px;
  --navbar-height: 50px;
  --tags-height: 34px;
  --content-padding: 20px;

  /* --- Radius --- */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-round: 20px;

  /* --- Shadows --- */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.10);
  --shadow-xl: 0 12px 40px rgba(0, 0, 0, 0.12);

  /* --- Transitions --- */
  --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  /* --- Font --- */
  --font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
  --font-family-code: "SF Mono", "Menlo", "Monaco", "Consolas", monospace;
}
</style>
<style>
/* ================================================================
   Global Reset & Base Styles
   ================================================================ */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #app {
  height: 100%;
  font-family: var(--font-family);
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  background-color: var(--bg-page);
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-primary-light);
}

/* --- Scrollbar --- */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* --- Selection --- */
::selection {
  background-color: var(--color-primary-lightest);
  color: var(--color-primary);
}

/* ================================================================
   Element Plus Global Overrides
   ================================================================ */

/* --- Table --- */
.el-table {
  --el-table-border-color: var(--border-lighter);
  font-size: 14px;
}

.el-table th.el-table__cell {
  background-color: #fafafa !important;
  color: var(--text-primary);
  font-weight: 600;
  height: 48px;
  font-size: 13px;
}

.el-table td.el-table__cell {
  height: 44px;
}

.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
  background-color: #fafcfe;
}

.el-table__body tr:hover > td.el-table__cell {
  background-color: #f0f7ff !important;
}

/* --- Form --- */
.el-form--inline .el-form-item {
  margin-right: 16px;
}

.el-form--inline .el-form-item__label {
  color: var(--text-regular);
  font-weight: 500;
}

/* --- Button --- */
.el-button + .el-button {
  margin-left: 8px;
}

/* --- Tag --- */
.el-tag {
  border-radius: var(--radius-sm);
  font-weight: 500;
}

/* --- Dialog --- */
.el-dialog {
  border-radius: 8px;
  box-shadow: var(--shadow-xl);
}

.el-dialog__header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border-lighter);
  margin-right: 0;
}

.el-dialog__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.el-dialog__body {
  padding: 24px;
}

.el-dialog__footer {
  padding: 12px 24px 20px;
  border-top: 1px solid var(--border-lighter);
}

/* --- Pagination --- */
.el-pagination {
  padding: 16px 0;
  justify-content: flex-end;
}

.el-pagination.is-background .btn-next.is-active,
.el-pagination.is-background .btn-prev.is-active,
.el-pagination.is-background .el-pager li.is-active {
  background-color: var(--color-primary) !important;
  border-radius: var(--radius-sm);
}

/* --- Tabs --- */
.el-tabs__item {
  font-weight: 500;
}

/* --- Input --- */
.el-input__inner:focus,
.el-textarea__inner:focus {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2) !important;
}

/* --- Select --- */
.el-select .el-input.is-focus .el-input__inner {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2) !important;
}

/* --- Alert --- */
.el-alert {
  border-radius: var(--radius-md);
}

/* --- Card (if used) --- */
.el-card {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-lighter);
  box-shadow: var(--shadow-sm);
}
</style>