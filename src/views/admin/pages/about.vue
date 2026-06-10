<template>
  <div class="card mt-2 shadow-sm">
    <div class="card-body">
      <!-- 页面标题 -->
      <div class="d-flex align-items-center mb-4">
        <i class="bi bi-info-circle text-primary fs-4 me-2"></i>
        <h5 class="card-title mb-0">关于系统</h5>
      </div>

      <!-- 系统基本信息 -->
      <div class="mb-4">
        <h6 class="text-muted fw-semibold mb-3">系统信息</h6>
        <ul class="list-group list-group-flush">
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>系统名称</span>
            <span class="fw-semibold">inisv1</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>当前版本</span>
            <span class="fw-semibold text-primary">v1.0.0</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>更新时间</span>
            <span class="fw-semibold">{{ updateTime }}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>开发模式</span>
            <span class="fw-semibold">{{ isProduction ? '生产环境' : '开发环境' }}</span>
          </li>
        </ul>
      </div>

      <!-- 技术栈 -->
      <div class="mb-4">
        <h6 class="text-muted fw-semibold mb-3">技术栈</h6>
        <div class="d-flex flex-wrap gap-2">
          <span class="badge bg-primary-subtle text-primary py-2 px-3">Vue 3</span>
          <span class="badge bg-primary-subtle text-primary py-2 px-3">Vite</span>
          <span class="badge bg-primary-subtle text-primary py-2 px-3">Element Plus</span>
          <span class="badge bg-primary-subtle text-primary py-2 px-3">Bootstrap 5</span>
          <span class="badge bg-primary-subtle text-primary py-2 px-3">JavaScript/TypeScript</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 当前年份
const currentYear = ref(new Date().getFullYear())

// 系统更新时间（可从接口获取，这里模拟）
const updateTime = ref('2024-05-20 15:30:00')

// 是否生产环境
const isProduction = ref(import.meta.env.PROD)

// Node.js版本（前端模拟，实际可从后端接口获取）
const nodeVersion = ref('18.17.1')

// 浏览器信息
const browserInfo = ref('')

// 获取浏览器信息
const getBrowserInfo = () => {
  const userAgent = navigator.userAgent
  let browser = ''
  
  if (userAgent.includes('Chrome')) {
    browser = 'Chrome ' + userAgent.match(/Chrome\/(\d+)/)[1]
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox ' + userAgent.match(/Firefox\/(\d+)/)[1]
  } else if (userAgent.includes('Safari')) {
    browser = 'Safari ' + userAgent.match(/Version\/(\d+)/)[1]
  } else if (userAgent.includes('Edge')) {
    browser = 'Edge ' + userAgent.match(/Edge\/(\d+)/)[1]
  } else {
    browser = '未知浏览器'
  }
  
  return browser
}

// 页面挂载时获取浏览器信息
onMounted(() => {
  browserInfo.value = getBrowserInfo()
})
</script>