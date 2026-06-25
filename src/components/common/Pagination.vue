<template>
  <div class="pagination-wrapper">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="currentPageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="total"
      :layout="layout"
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  total: {
    type: Number,
    default: 0
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  }
})

const emit = defineEmits(['update:modelValue', 'update:pageSize', 'change'])

const currentPage = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const currentPageSize = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:pageSize', val)
})

function handleSizeChange(size) {
  emit('change', { page: 1, pageSize: size })
}

function handleCurrentChange(page) {
  emit('change', { page, pageSize: props.pageSize })
}
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}
</style>