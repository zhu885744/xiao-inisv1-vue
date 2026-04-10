<!-- 自定义公告组件 - 简洁风格 -->
<template>
  <!-- 悬浮按钮 -->
  <button 
    v-if="!$route.path.startsWith('/admin')"
    class="notice-float-btn btn btn-lg rounded-circle shadow-lg"
    @click="openNoticeList"
    title="系统公告"
  >
    <i class="bi bi-megaphone-fill"></i>
    <span 
      v-if="noticeList.length > 0" 
      class="notice-badge position-absolute top-0 end-0 translate-middle badge rounded-pill bg-warning text-dark"
    >
      {{ noticeList.length }}
    </span>
  </button>

  <!-- 公告列表弹窗 -->
  <div 
    class="modal fade notice-modal" 
    id="noticeListModal" 
    tabindex="-1" 
    aria-hidden="true" 
    ref="noticeListModal"
  >
    <div class="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg animate-fade">
        <div class="modal-header text-white">
          <h5 class="modal-title d-flex align-items-center">
            <i class="bi bi-megaphone-fill me-2"></i>系统公告
          </h5>
          <button 
            type="button" 
            class="btn-close btn-close-white" 
            data-bs-dismiss="modal" 
            aria-label="关闭"
          ></button>
        </div>
        <div class="modal-body p-0">
          <!-- 加载状态 -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">加载中...</span>
            </div>
          </div>
          
          <!-- 公告列表 -->
          <div v-else-if="noticeList.length > 0" class="list-group list-group-flush">
            <button
              v-for="notice in noticeList"
              :key="notice.id"
              class="list-group-item list-group-item-action py-3 px-4 border-start-0 border-end-0"
              @click="openNoticeDetail(notice)"
            >
              <div class="d-flex justify-content-between align-items-center">
                <div class="flex-grow-1 me-3 text-start">
                  <h6 class="mb-1 fw-semibold">{{ notice.title }}</h6>
                  <small class="text-muted">{{ formatDate(notice.create_time) }}</small>
                </div>
                <i class="bi bi-chevron-right text-muted opacity-75"></i>
              </div>
            </button>
          </div>
          
          <!-- 空状态 -->
          <div v-else class="text-center py-5">
            <i class="bi bi-inbox text-muted fs-1 d-block mb-3 opacity-50"></i>
            <p class="text-muted mb-0">暂无系统公告</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 公告详情弹窗 -->
  <div 
    class="modal fade notice-modal" 
    id="noticeDetailModal" 
    tabindex="-1" 
    aria-hidden="true" 
    ref="noticeDetailModal"
  >
    <div class="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg animate-fade">
        <div class="modal-header text-white">
          <h5 class="modal-title">{{ currentNotice?.title || '公告详情' }}</h5>
          <button 
            type="button" 
            class="btn-close btn-close-white" 
            data-bs-dismiss="modal" 
            aria-label="关闭"
          ></button>
        </div>
        <div class="modal-body">
          <!-- 公告信息 -->
          <div class="d-flex flex-wrap gap-2 mb-3">
            <span class="badge bg-primary text-white">
              <i class="bi bi-tag me-1"></i>{{ currentNotice?.type || '系统公告' }}
            </span>
            <span class="badge bg-secondary">
              <i class="bi bi-calendar3 me-1"></i>{{ formatDate(currentNotice?.create_time) }}
            </span>
          </div>
          
          <!-- 公告内容 -->
          <div class="border rounded p-4">
            <div v-html="formatContent(currentNotice?.content)" class="text-break"></div>
          </div>
          
          <!-- 查看详情链接 -->
          <div v-if="currentNotice?.url" class="mt-3 text-center">
            <a
              :href="currentNotice.url"
              :target="currentNotice.target || '_blank'"
              class="btn btn-primary"
            >
              <i class="bi bi-link-45deg me-1"></i>查看详情
            </a>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="backToList">
            <i class="bi bi-arrow-left me-1"></i>返回列表
          </button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Modal } from 'bootstrap'
import request from '@/utils/request'
import utils from '@/utils/utils'

// 响应式数据
const noticeList = ref([])
const currentNotice = ref(null)
const noticeListModal = ref(null)
const noticeDetailModal = ref(null)
const loading = ref(false)
let listModalInstance = null
let detailModalInstance = null

// 获取公告列表
const fetchNotices = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/placard/all', {
      page: 1,
      limit: 10,
      order: 'create_time desc'
    })
    
    if (res.code === 200 && res.data?.data) {
      noticeList.value = res.data.data
    }
  } catch (error) {
    console.error('获取公告失败:', error)
  } finally {
    loading.value = false
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

// 打开公告列表
const openNoticeList = () => {
  if (!listModalInstance) return
  listModalInstance.show()
}

// 打开公告详情 - 丝滑切换
const openNoticeDetail = (notice) => {
  currentNotice.value = notice

  noticeListModal.value.addEventListener('hidden.bs.modal', function onHide() {
    detailModalInstance.show()
    noticeListModal.value.removeEventListener('hidden.bs.modal', onHide)
  })
  
  listModalInstance.hide()
}

// 返回公告列表 - 丝滑切换
const backToList = () => {
  noticeDetailModal.value.addEventListener('hidden.bs.modal', function onHide() {
    listModalInstance.show()
    noticeDetailModal.value.removeEventListener('hidden.bs.modal', onHide)
  })
  
  detailModalInstance.hide()
}

// 初始化弹窗
const initModals = () => {
  if (noticeListModal.value) {
    listModalInstance = new Modal(noticeListModal.value, {
      backdrop: true,
      keyboard: true
    })
  }
  if (noticeDetailModal.value) {
    detailModalInstance = new Modal(noticeDetailModal.value, {
      backdrop: true,
      keyboard: true
    })
  }
}

// 清理资源
const cleanup = () => {
  listModalInstance?.dispose()
  detailModalInstance?.dispose()
}

// 生命周期
onMounted(() => {
  initModals()
  fetchNotices()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
/* 悬浮按钮 - 适配Bootstrap5 */
.notice-float-btn {
  position: fixed;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 3.5rem;
  height: 3.5rem;
  background: linear-gradient(135deg, var(--bs-primary), #c73e54);
  border: none;
  color: #fff;
  font-size: 1.5rem;
  z-index: 1055;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notice-float-btn:hover {
  transform: translateY(-50%) scale(1.08);
  filter: brightness(1.1);
}

/* 核心丝滑弹窗动画 */
.modal.fade .modal-dialog {
  transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.28s ease !important;
  transform: translate3d(0, 20px, 0) scale(0.96);
  opacity: 0;
}

.modal.fade.show .modal-dialog {
  transform: translate3d(0, 0, 0) scale(1);
  opacity: 1;
}

.animate-fade {
  animation: contentFade 0.3s ease forwards;
}

@keyframes contentFade {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 列表项交互 */
.list-group-item {
  transition: background-color 0.2s ease;
}
.list-group-item:hover {
  background-color: var(--bs-light);
}

/* 响应式 */
@media (max-width: 768px) {
  .notice-float-btn {
    right: 1rem;
    width: 3rem;
    height: 3rem;
    font-size: 1.25rem;
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  :root { --bs-light: #212529; }
  .modal-content { background-color: #2b3035; color: #e9ecef; }
  .modal-header { background-color: var(--bs-primary) !important; }
  .list-group-item { background-color: #2b3035; border-color: #495057; color: #e9ecef; }
  .list-group-item:hover { background-color: #343a40; }
  .text-muted { color: #adb5bd !important; }
  .border.rounded.p-4 { background-color: #343a40; border-color: #495057; }
}
</style>