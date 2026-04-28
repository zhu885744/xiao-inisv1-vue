<template>
  <div class="min-vh-100 bg-secondary bg-gradient d-flex align-items-center justify-content-center py-4 px-3">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-xl-5 col-lg-6 col-md-7 col-sm-9">
          <!-- 纯 Bootstrap5 卡片布局 -->
          <div class="card shadow-lg border-0 rounded-4 overflow-hidden">
            <!-- 卡片头部：渐变背景 + 图标标题 -->
            <div class="card-header bg-primary bg-gradient text-white text-center py-5">
              <!-- 图标容器 -->
              <div class="d-inline-flex align-items-center justify-content-center bg-white bg-opacity-25 rounded-circle p-3 mb-3">
                <i class="bi bi-wrench display-6"></i>
              </div>
              <h2 class="card-title fw-bold mb-0">
                {{ maintenanceConfig.title || '网站维护中' }}
              </h2>
            </div>

            <!-- 卡片内容 -->
            <div class="card-body bg-dark text-white p-5">
              <!-- 维护说明 -->
              <p class="card-text text-center text-light mb-5">
                {{ maintenanceConfig.content || '我们正在对网站进行维护升级，感谢您的耐心等待。' }}
              </p>

              <!-- 倒计时展示 -->
              <div v-if="maintenanceConfig.end_time && !isEnded" class="mb-5">
                <p class="text-center mb-3">预计恢复时间</p>
                <div class="d-flex justify-content-center gap-2 gap-md-3">
                  <!-- 天 -->
                  <div class="bg-secondary rounded-3 px-3 px-md-4 py-3 text-center flex-fill" style="max-width: 90px;">
                    <div class="fs-2 fw-bold">{{ countdown.days }}</div>
                    <div class="text-xs mt-1">天</div>
                  </div>
                  <!-- 时 -->
                  <div class="bg-secondary rounded-3 px-3 px-md-4 py-3 text-center flex-fill" style="max-width: 90px;">
                    <div class="fs-2 fw-bold">{{ countdown.hours }}</div>
                    <div class="text-xs mt-1">时</div>
                  </div>
                  <!-- 分 -->
                  <div class="bg-secondary rounded-3 px-3 px-md-4 py-3 text-center flex-fill" style="max-width: 90px;">
                    <div class="fs-2 fw-bold">{{ countdown.minutes }}</div>
                    <div class="text-xs mt-1">分</div>
                  </div>
                  <!-- 秒 -->
                  <div class="bg-secondary rounded-3 px-3 px-md-4 py-3 text-center flex-fill" style="max-width: 90px;">
                    <div class="fs-2 fw-bold">{{ countdown.seconds }}</div>
                    <div class="text-xs mt-1">秒</div>
                  </div>
                </div>
              </div>

              <!-- 维护结束提示 -->
              <div v-else-if="isEnded" class="mb-5 text-center">
                <div class="alert alert-success d-inline-flex align-items-center gap-2 mb-0">
                  <i class="bi bi-check-circle-fill fs-5"></i>
                  维护已结束，页面即将跳转至首页...
                </div>
              </div>

              <!-- 最后更新时间 -->
              <div class="text-center small pt-3 border-top border-secondary">
                <i class="bi bi-clock me-1"></i>
                最后更新: {{ lastUpdate }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useCommStore } from '@/store/comm'

const store = useCommStore()

// 维护配置
const maintenanceConfig = computed(() => {
  return store.siteInfo?.maintenance || {}
})

// 维护是否结束
const isEnded = computed(() => {
  if (!maintenanceConfig.value.end_time) return false
  const endTime = new Date(maintenanceConfig.value.end_time).getTime()
  return Date.now() > endTime
})

// 倒计时数据
const countdown = ref({
  days: '00',
  hours: '00',
  minutes: '00',
  seconds: '00'
})

// 最后更新时间
const lastUpdate = computed(() => {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

let timer = null

// 更新倒计时
const updateCountdown = () => {
  if (!maintenanceConfig.value.end_time) return
  
  const endTime = new Date(maintenanceConfig.value.end_time).getTime()
  const now = Date.now()
  const diff = endTime - now
  
  if (diff <= 0) {
    setTimeout(() => {
      window.location.href = '/'
    }, 3000)
    return
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  countdown.value = {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  }
}

// 监听配置变化重启倒计时
watch(maintenanceConfig, () => {
  if (timer) clearInterval(timer)
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
}, { immediate: true })

onMounted(() => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>