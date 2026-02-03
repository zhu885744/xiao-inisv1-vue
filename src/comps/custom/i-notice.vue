<template>
  <!-- 公告卡片 -->
  <div class="card mt-2 mb-3 shadow-sm" v-if="noticeList.length > 0">
    <!-- 公告轮播 -->
    <div v-if="noticeList.length === 1" class="single-notice">
      <div class="card-body d-flex align-items-center py-2 px-3 notice-item" @click="handleNoticeClick(noticeList[0])">
        <span class="badge text-bg-danger me-2"><i class="bi bi-megaphone"></i></span>
        <span class="fw-medium fs-7 truncate-title">{{ noticeList[0].title }}</span>
        <span class="ms-auto text-muted x-small">{{ formatTime(noticeList[0].create_time) }}</span>
        <i class="bi bi-chevron-right ms-2"></i>
      </div>
    </div>
    
    <!-- 多个公告轮播 -->
    <div v-else class="carousel slide" data-bs-ride="carousel" ref="carousel">
      <div class="carousel-inner">
        <div 
          v-for="(notice, index) in noticeList" 
          :key="notice.id" 
          :class="['carousel-item', { 'active': index === 0 }]"
          @click="handleNoticeClick(notice)"
        >
          <div class="card-body d-flex align-items-center py-2 px-3 notice-item">
            <span class="badge text-bg-danger me-2"><i class="bi bi-megaphone"></i></span>
            <span class="fw-medium fs-7 truncate-title">{{ notice.title }}</span>
            <span class="ms-auto text-muted x-small">{{ formatTime(notice.create_time) }}</span>
            <i class="bi bi-chevron-right ms-2"></i>
          </div>
        </div>
      </div>
      
      <!-- 轮播指示器 -->
      <div class="carousel-indicators position-static mt-1" v-if="noticeList.length > 1">
        <button
          v-for="index in noticeList.length"
          :key="index"
          type="button"
          data-bs-target="#noticeCarousel"
          :data-bs-slide-to="index - 1"
          :class="{ 'active': index === 1 }"
          class="indicator-dot"
          aria-label="Slide"
        ></button>
      </div>
    </div>
  </div>
  
  <!-- 公告弹窗 -->
  <div class="modal fade" id="noticeModal" tabindex="-1" aria-hidden="true" ref="noticeModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-bottom-0 pb-0">
          <h5 class="modal-title d-flex align-items-center">
            <i class="bi bi-megaphone text-danger me-2"></i>
            {{ currentNotice?.title || '公告' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body pt-0">
          <!-- 公告元信息 -->
          <div class="notice-meta d-flex align-items-center mt-2">
            <span class="badge bg-light text-dark me-2">
              <i class="bi bi-tag"></i> {{ currentNotice?.type || '系统通知' }}
            </span>
            <span class="text-muted small">
              <i class="bi bi-calendar3 me-1"></i>
              {{ currentNotice?.create_time ? formatTime(currentNotice.create_time) : '' }}
            </span>
          </div>
          
          <!-- 公告内容 -->
          <div class="notice-content mt-2">
            <div v-html="formatContent(currentNotice?.content || '')"></div>
            
            <!-- 链接按钮 -->
            <div v-if="currentNotice?.url" class="text-center mt-4">
              <a 
                :href="currentNotice.url" 
                :target="currentNotice.target || '_blank'"
                class="btn btn-primary btn-sm"
              >
                <i class="bi bi-link-45deg me-1"></i>查看详情
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Modal } from 'bootstrap'
import request from '@/utils/request'
import iMarkdown from '@/comps/custom/i-markdown.vue'

// 响应式数据
const noticeList = ref([])
const currentNotice = ref(null)
const carousel = ref(null)
const noticeModal = ref(null)
let modalInstance = null
let carouselInstance = null

// 获取公告列表
const fetchNotices = async () => {
  try {
    const res = await request.get('/api/placard/all', {
      page: 1,
      limit: 5,
      order: 'create_time desc'
    })
    
    if (res.code === 200 && res.data?.data) {
      noticeList.value = res.data.data
      
      // 如果有多个公告，初始化轮播
      if (noticeList.value.length > 1 && carousel.value) {
        setTimeout(() => {
          carouselInstance = new window.bootstrap.Carousel(carousel.value, {
            interval: 5000, // 5秒自动轮播
            wrap: true,
            touch: true
          })
        }, 100)
      }
    }
  } catch (error) {
    console.error('获取公告失败:', error)
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return '未知时间'
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 格式化内容（处理HTML换行等）
const formatContent = (content) => {
  if (!content) return ''
  // 将 \n 转换为 <br>，并安全地显示HTML
  return content.replace(/\n/g, '<br>')
}

// 处理公告点击
const handleNoticeClick = (notice) => {
  currentNotice.value = notice
  if (!modalInstance && noticeModal.value) {
    modalInstance = new Modal(noticeModal.value)
  }
  modalInstance?.show()
}

// 清理资源
const cleanup = () => {
  if (carouselInstance) {
    carouselInstance.dispose()
    carouselInstance = null
  }
  if (modalInstance) {
    modalInstance.dispose()
    modalInstance = null
  }
}

// 生命周期
onMounted(() => {
  fetchNotices()
  // 初始化模态框
  if (noticeModal.value) {
    modalInstance = new Modal(noticeModal.value)
  }
})

onUnmounted(() => {
  cleanup()
})
</script>