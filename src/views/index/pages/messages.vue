<template>
  <div class="mt-2">
    <!-- 页面标题 -->
    <div class="card shadow-sm mt-2">
      <div class="card-body py-3">
        <h5 class="card-title mb-0 d-flex align-items-center gap-2">
          <i class="bi bi-bell-fill text-primary"></i>
          通知中心
        </h5>
      </div>
    </div>

    <!-- 标签页导航 -->
    <div class="mt-2">
      <div class="card shadow-sm">
        <div class="card-body p-0">
          <ul class="nav nav-tabs" id="messageTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'comments' }"
                id="comments-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#comments" 
                type="button" 
                role="tab" 
                aria-controls="comments" 
                :aria-selected="activeTab === 'comments'"
                @click="activeTab = 'comments'"
              >
                <i class="bi bi-chat-dots me-1"></i>评论
                <span v-if="unreadComments > 0" class="badge bg-primary ms-1">{{ unreadComments }}</span>
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'likes' }"
                id="likes-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#likes" 
                type="button" 
                role="tab" 
                aria-controls="likes" 
                :aria-selected="activeTab === 'likes'"
                @click="activeTab = 'likes'"
              >
                <i class="bi bi-heart me-1"></i>点赞
                <span v-if="unreadLikes > 0" class="badge bg-danger ms-1">{{ unreadLikes }}</span>
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'private' }"
                id="private-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#private" 
                type="button" 
                role="tab" 
                aria-controls="private" 
                :aria-selected="activeTab === 'private'"
                @click="activeTab = 'private'"
              >
                <i class="bi bi-envelope me-1"></i>私信
                <span v-if="unreadMessages > 0" class="badge bg-success ms-1">{{ unreadMessages }}</span>
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'system' }"
                id="system-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#system" 
                type="button" 
                role="tab" 
                aria-controls="system" 
                :aria-selected="activeTab === 'system'"
                @click="activeTab = 'system'"
              >
                <i class="bi bi-bell me-1"></i>系统通知
                <span v-if="unreadSystem > 0" class="badge bg-warning text-dark ms-1">{{ unreadSystem }}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 标签页内容 -->
    <div class="tab-content mt-2" id="messageTabsContent">
      <!-- 评论消息 -->
      <div class="tab-pane fade" :class="{ 'show active': activeTab === 'comments' }" id="comments" role="tabpanel" aria-labelledby="comments-tab">
        <div class="card shadow-sm">
          <div class="card-body text-center py-5">
            <i class="bi bi-chat-dots text-muted fs-1 d-block mb-3"></i>
            <p class="text-muted mb-0">暂无评论消息</p>
          </div>
        </div>
      </div>

      <!-- 点赞消息 -->
      <div class="tab-pane fade" :class="{ 'show active': activeTab === 'likes' }" id="likes" role="tabpanel" aria-labelledby="likes-tab">
        <div class="card shadow-sm">
          <div class="card-body text-center py-5">
            <i class="bi bi-heart text-muted fs-1 d-block mb-3"></i>
            <p class="text-muted mb-0">暂无点赞消息</p>
          </div>
        </div>
      </div>

      <!-- 私信消息 -->
      <div class="tab-pane fade" :class="{ 'show active': activeTab === 'private' }" id="private" role="tabpanel" aria-labelledby="private-tab">
        <div class="card shadow-sm">
          <div class="card-body text-center py-5">
            <i class="bi bi-envelope text-muted fs-1 d-block mb-3"></i>
            <p class="text-muted mb-0">暂无私信消息</p>
          </div>
        </div>
      </div>

      <!-- 系统通知 -->
      <div class="tab-pane fade" :class="{ 'show active': activeTab === 'system' }" id="system" role="tabpanel" aria-labelledby="system-tab">
        <div class="card shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center py-2">
            <span class="fw-semibold">系统通知</span>
            <button class="btn btn-sm btn-outline-secondary" @click="markAllAsRead">
              <i class="bi bi-check-all me-1"></i>全部已读
            </button>
          </div>
          <div class="card-body p-0">
            <!-- 加载状态 -->
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border spinner-border-sm text-secondary" role="status">
                <span class="visually-hidden">加载中...</span>
              </div>
            </div>
            
            <!-- 通知列表 -->
            <div v-else-if="noticeList.length > 0" class="list-group list-group-flush">
              <div 
                v-for="notice in noticeList" 
                :key="notice.id"
                class="list-group-item list-group-item-action p-3"
                style="cursor: pointer;"
                @click="openNoticeModal(notice)"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div class="d-flex align-items-start gap-3 flex-grow-1 overflow-hidden">
                    <div class="bg-primary bg-opacity-10 p-2 rounded flex-shrink-0">
                      <i class="bi bi-bell-fill text-primary"></i>
                    </div>
                    <div class="flex-grow-1 overflow-hidden" style="min-width: 0;">
                      <h6 class="mb-1 text-truncate">{{ notice.title }}</h6>
                      <p class="mb-1 text-muted small text-truncate">{{ formatContentPreview(notice.content) }}</p>
                      <small class="text-muted">{{ formatDate(notice.create_time) }}</small>
                    </div>
                  </div>
                  <span class="badge bg-warning text-dark flex-shrink-0 ms-2">公告</span>
                </div>
              </div>
            </div>
            
            <!-- 空状态 -->
            <div v-else class="text-center py-5">
              <i class="bi bi-bell-slash text-muted fs-1 d-block mb-3"></i>
              <p class="text-muted mb-0">暂无系统通知</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 公告弹窗 -->
  <div class="modal fade" id="noticeModal" tabindex="-1" aria-hidden="true" ref="noticeModal">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-bell-fill text-warning me-2"></i>
            {{ currentNotice?.title || '系统公告' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <span class="badge bg-warning text-dark me-2">
              <i class="bi bi-tag me-1"></i>{{ currentNotice?.type || '系统通知' }}
            </span>
            <small class="text-muted">
              <i class="bi bi-calendar3 me-1"></i>{{ formatDate(currentNotice?.create_time) }}
            </small>
          </div>
          <hr>
          <div v-html="formatContent(currentNotice?.content)" class="mt-3"></div>
        </div>
        <div class="modal-footer">
          <a v-if="currentNotice?.url" :href="currentNotice.url" :target="currentNotice.target || '_blank'" class="btn btn-primary">
            <i class="bi bi-link-45deg me-1"></i>查看详情
          </a>
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
import { usePageTitle } from '@/utils/usePageTitle'

// 设置页面标题
const { setDynamicTitle } = usePageTitle()
setDynamicTitle('通知中心')

// 响应式数据
const noticeList = ref([])
const currentNotice = ref(null)
const noticeModal = ref(null)
const activeTab = ref('system')
const loading = ref(false)

// 未读消息计数
const unreadComments = ref(0)
const unreadLikes = ref(0)
const unreadMessages = ref(0)
const unreadSystem = ref(0)

let modalInstance = null

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
      unreadSystem.value = noticeList.value.length
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
    return utils.timeToDate(timestamp, 'Y-m-d H:i')
  } catch {
    return '未知时间'
  }
}

// 格式化内容
const formatContent = (content) => {
  if (!content) return '<p class="text-muted">暂无公告内容</p>'
  return content.replace(/\n/g, '<br>')
}

// 格式化内容预览
const formatContentPreview = (content) => {
  if (!content) return '暂无内容'
  const plainText = content.replace(/<[^>]+>/g, '').replace(/\n/g, ' ')
  return plainText.length > 80 ? plainText.substring(0, 80) + '...' : plainText
}

// 打开公告弹窗
const openNoticeModal = (notice) => {
  currentNotice.value = notice
  unreadSystem.value = Math.max(0, unreadSystem.value - 1)
  modalInstance?.show()
}

// 标记所有为已读
const markAllAsRead = () => {
  unreadSystem.value = 0
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
.min-width-0 {
  min-width: 0;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.nav-tabs {
  border-bottom: 1px solid #dee2e6;
}

.nav-tabs .nav-link {
  border: none;
  border-radius: 0;
  padding: 0.75rem 1rem;
  color: #6c757d;
  transition: all 0.2s;
  margin-bottom: -1px;
}

.nav-tabs .nav-link:hover {
  color: #495057;
  background-color: #f8f9fa;
  border: none;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  background-color: #fff;
  border: none;
  border-bottom: 2px solid #0d6efd;
  font-weight: 600;
}

.badge {
  font-weight: 500;
}

.bg-opacity-10 {
  background-color: rgba(13, 110, 253, 0.1) !important;
}
</style>