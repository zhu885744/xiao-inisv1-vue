<template>
  <!-- 首页顶部公告卡片 -->
  <div class="alert alert-danger alert-dismissible fade show mb-3 border-0 shadow-sm" v-if="noticeList.length > 0" role="alert">
    <div class="container">
      <div class="d-flex flex-wrap align-items-center justify-content-between">
        <!-- 公告内容 -->
        <div class="flex-grow-1 me-3">
          <div class="d-flex align-items-center">
            <i class="bi bi-megaphone me-2"></i>
            <span class="fw-medium text-truncate" style="max-width: 400px;">
              {{ showNoticeList[0]?.title || '' }}
            </span>
            <span v-if="noticeList.length > 1" class="ms-2 text-muted small">
              ({{ noticeList.length }}条)
            </span>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="d-flex align-items-center gap-2">
          <!-- 查看更多按钮 -->
          <button v-if="noticeList.length > 1" type="button" class="btn btn-sm btn-outline-light text-danger" @click="toggleExpand">
            {{ isExpand ? '收起' : '查看更多' }}
            <i class="bi ms-1" :class="isExpand ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </button>
          
          <!-- 详情按钮 -->
          <button type="button" class="btn btn-sm btn-light text-danger" @click="openNoticeModal(showNoticeList[0])">
            详情
          </button>
          
          <!-- 关闭按钮 -->
          <button type="button" class="btn-close btn-close-danger" data-bs-dismiss="alert" aria-label="关闭"></button>
        </div>
      </div>
      
      <!-- 展开的公告列表 -->
      <div v-if="isExpand && noticeList.length > 1" class="mt-2 border-top border-danger-subtle pt-2">
        <ul class="list-unstyled mb-0">
          <li v-for="(notice, index) in noticeList.slice(1)" :key="notice.id" class="py-1">
            <a href="#" class="text-decoration-none text-danger-hover" @click.prevent="openNoticeModal(notice)">
              <div class="d-flex align-items-center">
                <span class="badge bg-danger-subtle text-danger-emphasis me-2">{{ index + 2 }}</span>
                <span class="text-truncate">{{ notice.title }}</span>
                <span class="ms-auto text-muted small">{{ formatDate(notice.create_time) }}</span>
              </div>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- 空状态 -->
  <div v-else class="alert alert-light mb-3 border-0 shadow-sm" role="alert">
    <div class="container text-center">
      <i class="bi bi-megaphone text-muted me-2"></i>
      <span class="text-muted">暂无系统公告</span>
    </div>
  </div>

  <!-- 公告弹窗 -->
  <div class="modal fade" id="noticeModal" tabindex="-1" aria-hidden="true" ref="noticeModal">
    <div class="modal-dialog modal-dialog-centered modal-md">
      <div class="modal-content shadow">
        <div class="modal-header bg-danger-subtle border-bottom border-danger">
          <h5 class="modal-title d-flex align-items-center mb-0 text-danger-emphasis">
            <i class="bi bi-megaphone me-2"></i>
            {{ currentNotice?.title || '系统公告' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="关闭"></button>
        </div>

        <div class="modal-body">
          <!-- 公告内容 -->
          <div class="p-3 bg-light rounded mb-4" style="max-height: 300px; overflow-y: auto;">
            <div v-html="formatContent(currentNotice?.content)" class="text-wrap"></div>
          </div>

          <!-- 查看详情链接 -->
          <div v-if="currentNotice?.url" class="text-center mb-4">
            <a
              :href="currentNotice.url"
              :target="currentNotice.target || '_blank'"
              class="btn btn-outline-danger rounded-pill px-4 text-decoration-none w-100"
            >
              <i class="bi bi-link-45deg me-1"></i>查看详情
            </a>
          </div>

          <!-- 公告信息 -->
          <div class="d-flex align-items-center flex-wrap gap-2">
            <span class="badge bg-danger-subtle text-danger-emphasis border border-danger-subtle">
              <i class="bi bi-tag me-1"></i> {{ currentNotice?.type || '系统通知' }}
            </span>
            <span class="badge bg-success-subtle text-success-emphasis border border-success-subtle">
              <i class="bi bi-calendar3 me-1"></i>
              {{ formatDate(currentNotice?.create_time) }}
            </span>
          </div>
        </div>

        <div class="modal-footer border-top">
          <button type="button" class="btn btn-outline-danger rounded-pill px-4 w-100" data-bs-dismiss="modal">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Modal } from 'bootstrap'
import request from '@/utils/request'
import utils from '@/utils/utils'

// 响应式数据
const noticeList = ref([])
const currentNotice = ref(null)
const noticeModal = ref(null)
const isExpand = ref(false)
let modalInstance = null

// 显示的公告列表
const showNoticeList = computed(() => {
  return noticeList.value
})

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
    }
  } catch (error) {
    console.error('获取公告失败:', error)
  }
}

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '未知时间'
  
  try {
    return utils.timeToDate(timestamp, 'Y-m-d')
  } catch {
    return '未知时间'
  }
}

// 格式化内容
const formatContent = (content) => {
  if (!content) return '<p class="text-muted mb-0">暂无公告内容</p>'
  return content.replace(/\n/g, '<br>')
}

// 打开公告弹窗
const openNoticeModal = (notice) => {
  currentNotice.value = notice
  modalInstance?.show()
}

// 切换展开状态
const toggleExpand = () => {
  isExpand.value = !isExpand.value
}

// 初始化弹窗
const initModal = () => {
  if (noticeModal.value) {
    modalInstance = new Modal(noticeModal.value, {
      backdrop: true,
      keyboard: true
    })
  }
}

// 清理资源
const cleanup = () => {
  modalInstance?.dispose()
  modalInstance = null
}

// 生命周期
onMounted(() => {
  initModal()
  fetchNotices()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
/* 响应式调整 */
@media (max-width: 768px) {
  .text-truncate {
    max-width: 200px;
  }
  
  .modal-dialog {
    margin: 1rem;
  }
}

/* 悬停效果 */
.text-danger-hover:hover {
  color: var(--bs-danger) !important;
}
</style>