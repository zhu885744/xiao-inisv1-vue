<template>
  <div class="min-vh-100 bg-secondary bg-gradient d-flex align-items-center justify-content-center py-4 px-3">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-xl-5 col-lg-6 col-md-7 col-sm-9">
          <div class="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div class="card-header bg-primary bg-gradient text-white text-center py-5">
              <div class="d-inline-flex align-items-center justify-content-center bg-white bg-opacity-25 rounded-circle p-3 mb-3">
                <i class="bi bi-wrench display-6"></i>
              </div>
              <h2 class="card-title fw-bold mb-0">
                {{ maintenanceConfig.title || '网站维护中' }}
              </h2>
            </div>

            <div class="card-body bg-dark text-white p-5">
              <p class="card-text text-center text-light mb-5">
                {{ maintenanceConfig.content || '我们正在对网站进行维护升级，感谢您的耐心等待。' }}
              </p>

              <div v-if="maintenanceConfig.end_time && !isEnded" class="mb-5">
                <p class="text-center mb-3">预计恢复时间</p>
                <div class="d-flex justify-content-center gap-2 gap-md-3">
                  <div class="time-block bg-secondary rounded-3 px-3 px-md-4 py-3 text-center flex-fill" style="max-width: 90px;">
                    <div class="fs-2 fw-bold transition-all duration-300">{{ countdown.days }}</div>
                    <div class="text-xs mt-1">天</div>
                  </div>
                  <div class="time-block bg-secondary rounded-3 px-3 px-md-4 py-3 text-center flex-fill" style="max-width: 90px;">
                    <div class="fs-2 fw-bold transition-all duration-300">{{ countdown.hours }}</div>
                    <div class="text-xs mt-1">时</div>
                  </div>
                  <div class="time-block bg-secondary rounded-3 px-3 px-md-4 py-3 text-center flex-fill" style="max-width: 90px;">
                    <div class="fs-2 fw-bold transition-all duration-300">{{ countdown.minutes }}</div>
                    <div class="text-xs mt-1">分</div>
                  </div>
                  <div class="time-block bg-secondary rounded-3 px-3 px-md-4 py-3 text-center flex-fill" style="max-width: 90px;">
                    <div class="fs-2 fw-bold transition-all duration-300">{{ countdown.seconds }}</div>
                    <div class="text-xs mt-1">秒</div>
                  </div>
                </div>
              </div>

              <div v-else-if="isEnded" class="mb-5 text-center">
                <div class="alert alert-success d-inline-flex align-items-center gap-2 mb-0 animate-pulse">
                  <i class="bi bi-check-circle-fill fs-5"></i>
                  维护已结束，页面即将跳转至首页...
                </div>
              </div>

              <div v-if="showRefreshTip" class="text-center mb-4">
                <button @click="handleRefresh" class="btn btn-outline-primary btn-sm">
                  <i class="bi bi-arrow-clockwise me-1"></i>
                  刷新页面
                </button>
                <p class="text-xs text-muted mt-2">或按 F5 刷新</p>
              </div>

              <div class="text-center small pt-3 border-top border-secondary">
                <i class="bi bi-clock me-1"></i>
                最后更新: {{ lastUpdate }}
              </div>

              <div class="mt-4 text-center">
                <div class="d-flex justify-content-center gap-3">
                  <a v-if="socialLinks.github" :href="socialLinks.github" target="_blank" class="social-link">
                    <i class="bi bi-github"></i>
                  </a>
                  <a v-if="socialLinks.twitter" :href="socialLinks.twitter" target="_blank" class="social-link">
                    <i class="bi bi-twitter"></i>
                  </a>
                  <a v-if="socialLinks.weibo" :href="socialLinks.weibo" target="_blank" class="social-link">
                    <i class="bi bi-weibo"></i>
                  </a>
                </div>
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

const maintenanceConfig = computed(() => {
  return store.siteInfo?.maintenance || {}
})

const socialLinks = computed(() => {
  return store.siteInfo?.social || {}
})

const isEnded = computed(() => {
  if (!maintenanceConfig.value.end_time) return false
  const endTime = parseTime(maintenanceConfig.value.end_time)
  return Date.now() > endTime
})

const countdown = ref({
  days: '00',
  hours: '00',
  minutes: '00',
  seconds: '00'
})

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

const showRefreshTip = ref(true)

let animationFrameId = null
let lastTime = 0

const parseTime = (timeStr) => {
  if (typeof timeStr === 'number') return timeStr * 1000
  const timestamp = new Date(timeStr).getTime()
  return isNaN(timestamp) ? Date.now() : timestamp
}

const updateCountdown = (currentTime = Date.now()) => {
  if (!maintenanceConfig.value.end_time) return

  const endTime = parseTime(maintenanceConfig.value.end_time)
  const diff = endTime - currentTime

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

  const now = Date.now()
  if (now - lastTime >= 1000) {
    lastTime = now
  }

  animationFrameId = requestAnimationFrame(updateCountdown)
}

const handleRefresh = () => {
  window.location.reload()
}

watch(maintenanceConfig, () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  lastTime = 0
  updateCountdown()
}, { immediate: true })

onMounted(() => {
  updateCountdown()
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F5' || (e.key === 'r' && e.ctrlKey)) {
      e.preventDefault()
      handleRefresh()
    }
  })
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped>
.time-block {
  transition: transform 0.3s ease;
}

.time-block:hover {
  transform: scale(1.05);
}

.time-block div:first-child {
  font-variant-numeric: tabular-nums;
}

.social-link {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  transition: all 0.3s ease;
}

.social-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@media (prefers-reduced-motion: reduce) {
  .time-block {
    transition: none;
  }
  
  .social-link {
    transition: none;
  }
  
  .animate-pulse {
    animation: none;
  }
}
</style>