<template>
  <!-- 首页顶部公告卡片 -->
  <div class="card mt-2 mb-3 shadow-sm" v-if="noticeList.length > 0">
    <div class="card-body p-0">
      <!-- 首页顶部公告卡片列表 -->
      <div 
        class="notice-item d-flex align-items-center py-2 px-3 border-bottom"
        :class="{'border-light': !isDarkMode, 'border-dark-subtle': isDarkMode}"
        v-for="(notice, index) in showNoticeList"
        :key="notice.id"
        @click="handleNoticeClick(notice)"
      >
        <span class="badge text-bg-danger me-2"><i class="bi bi-megaphone"></i></span>
        <span class="fw-medium fs-7 truncate-title flex-1">{{ notice.title }}</span>
        <span class="ms-auto text-muted x-small">{{ formatTime(notice.create_time) }}</span>
      </div>
      <!-- 展开/折叠按钮-->
      <div v-if="noticeList.length > 1" class="text-center py-2">
        <button 
          class="btn btn-link text-danger fs-7 p-0 d-flex align-items-center mx-auto text-decoration-none"
          @click="isExpand = !isExpand"
          :class="{'hover-text-danger': true}"
        >
          {{ isExpand ? '折叠公告' : `查看更多(${noticeList.length - 1}条)` }}
          <i class="bi ms-1" :class="isExpand ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
      </div>
    </div>
  </div>
  <!-- 空状态 -->
  <div class="card mt-2 mb-3 shadow-sm py-4 text-center" v-else>
    <span class="text-muted fs-7">暂无系统公告</span>
  </div>

  <!-- 公告弹窗 -->
  <div class="modal fade" id="noticeModal" tabindex="-1" aria-hidden="true" ref="noticeModal">
    <div class="modal-dialog modal-dialog-centered modal-md">
      <div class="modal-content shadow">
        <!-- 弹窗头部 -->
        <div class="modal-header border-bottom py-3 px-4">
          <h5 class="modal-title d-flex align-items-center mb-0">
            <i class="bi bi-megaphone text-danger me-2"></i>
            {{ currentNotice?.title || '系统公告' }}
          </h5>
          
        </div>
        <!-- 弹窗主体-->
        <div class="modal-body p-4">
          
          <!-- 公告内容 -->
          <div class="notice-content p-3 rounded-3 scrollable-content">
            <div v-html="formatContent(currentNotice?.content || '')" class="notice-text"></div>
            <!-- 查看详情按钮 -->
            <div v-if="currentNotice?.url" class="text-center mt-4">
              <a 
                :href="currentNotice.url" 
                :target="currentNotice.target || '_blank'"
                class="btn btn-outline-secondary rounded-pill px-4"
                @mouseenter="handleBtnHover(true)"
                @mouseleave="handleBtnHover(false)"
              >
                <i class="bi bi-link-45deg me-1"></i>查看详情
              </a>
            </div>
          </div>
          <!-- 公告元信息 -->
          <div class="notice-meta d-flex align-items-center flex-wrap gap-2 mt-3">
            <span class="badge bg-danger-subtle text-danger-emphasis border border-danger-subtle">
              <i class="bi bi-tag me-1"></i> {{ currentNotice?.type || '系统通知' }}
            </span>
            <span class="badge bg-success-subtle text-success-emphasis border border-success-subtle">
              <i class="bi bi-calendar3 me-1"></i>
              {{ currentNotice?.create_time ? formatTime(currentNotice.create_time) : '' }}
            </span>
          </div>
        </div>
        <!-- 弹窗底部 -->
        <div class="modal-footer border-top py-3 px-4 justify-content-center">
          <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { Modal } from 'bootstrap'
import request from '@/utils/request'

// 响应式数据
const noticeList = ref([])
const currentNotice = ref(null)
const noticeModal = ref(null)
const isExpand = ref(false)
const isBtnHovered = ref(false)
let modalInstance = null

// 检测当前是否为深色模式（适配 Bootstrap 5）
const isDarkMode = computed(() => {
  return document.documentElement.getAttribute('data-bs-theme') === 'dark'
})

// 控制公告显示数量
const showNoticeList = computed(() => {
  return isExpand.value ? noticeList.value : noticeList.value.slice(0, 1)
})

// 获取公告列表
const fetchNotices = async () => {
  try {
    const res = await request.get('/api/placard/all', {
      page: 1,
      limit: 10,
      order: 'create_time desc',
      cache: false
    })
    if (res.code === 200 && res.data?.data) {
      noticeList.value = res.data.data
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

// 格式化内容
const formatContent = (content) => {
  if (!content) return '<p class="text-muted mb-0">暂无公告内容</p>'
  return content.replace(/\n/g, '<br>').replace(/\s+/g, ' ').replace(/<p>/g, '<p class="mb-2">')
}

// 处理公告点击
const handleNoticeClick = (notice) => {
  currentNotice.value = notice
  modalInstance?.show()
}

// 按钮 hover 效果
const handleBtnHover = (isHover) => {
  isBtnHovered.value = isHover
}

// 清理资源
const cleanup = () => {
  if (modalInstance) {
    modalInstance.dispose()
    modalInstance = null
  }
}

// 监听深色模式变化，更新弹窗样式
watch(isDarkMode, (newVal) => {
  if (modalInstance) {
    // 强制更新弹窗样式
    modalInstance._element.querySelector('.modal-content').classList.toggle('bg-dark', newVal)
    modalInstance._element.querySelector('.btn-close').classList.toggle('btn-close-white', newVal)
  }
})

// 生命周期
onMounted(() => {
  if (noticeModal.value) {
    modalInstance = new Modal(noticeModal.value, {
      backdrop: 'static', // 点击背景不关闭弹窗
      keyboard: true // 按 ESC 关闭弹窗
    })
  }
  fetchNotices()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
/* 基础样式优化 */
.truncate-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin: 0 0.5rem;
}

.notice-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* 公告项 hover 效果，适配深浅色 */
.notice-item:hover {
  background-color: var(--bs-tertiary-bg);
}

.fs-7 {
  font-size: 0.875rem !important;
}

.x-small {
  font-size: 0.75rem !important;
}

.hover-text-danger:hover {
  color: var(--bs-danger-hover) !important;
}

/* 公告内容滚动容器 - 完全适配 Bootstrap 5 深浅色 */
.scrollable-content {
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--bs-border-color) var(--bs-tertiary-bg);
  background-color: var(--bs-tertiary-bg);
  color: inherit;
  transition: all 0.2s ease;
}

/* Webkit 滚动条样式 - 适配深浅色 */
.scrollable-content::-webkit-scrollbar {
  width: 8px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: var(--bs-tertiary-bg);
  border-radius: 4px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background-color: var(--bs-border-color);
  border-radius: 4px;
  border: 2px solid var(--bs-tertiary-bg);
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--bs-border-color-subtle);
}

/* 深色模式下的滚动条优化 */
:deep([data-bs-theme="dark"]) .scrollable-content::-webkit-scrollbar-thumb {
  background-color: var(--bs-border-color-dark);
}

:deep([data-bs-theme="dark"]) .scrollable-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--bs-border-color);
}

/* 弹窗整体样式优化 - 穿透样式适配深浅色 */
:deep(.modal-content) {
  border: none;
  background-color: var(--bs-modal-bg);
  color: var(--bs-body-color);
  transition: background-color 0.2s ease;
}

:deep(.modal-header) {
  background-color: var(--bs-modal-header-bg);
  border-bottom-color: var(--bs-border-color);
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

:deep(.modal-footer) {
  background-color: var(--bs-modal-footer-bg);
  border-top-color: var(--bs-border-color);
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

:deep(.modal-body) {
  background-color: var(--bs-modal-bg);
}

/* 按钮样式优化 */
:deep(.btn-outline-secondary) {
  border-color: var(--bs-border-color);
  color: var(--bs-body-color);
}

:deep(.btn-outline-secondary:hover) {
  background-color: var(--bs-secondary-bg);
  border-color: var(--bs-border-color);
  color: var(--bs-body-color);
}

:deep(.btn-primary) {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  transition: all 0.2s ease;
}

:deep(.btn-primary:hover) {
  background-color: var(--bs-primary-hover);
  border-color: var(--bs-primary-hover);
}

/* 深色模式下的关闭按钮 */
:deep([data-bs-theme="dark"]) .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}

/* 公告文本样式 */
.notice-text {
  line-height: 1.6;
}

.notice-text p {
  margin-bottom: 0.75rem;
}

.notice-text p:last-child {
  margin-bottom: 0;
}
</style>