<template>
  <!-- 公告卡片 -->
  <i-notice />

  <!-- 加载状态 -->
  <div v-if="loading && articleList.length === 0" class="d-flex justify-content-center align-items-center py-5">
    <div class="spinner-border text-info" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <!-- 空数据状态 -->
  <div v-else-if="articleList.length === 0 && !loading" class="alert alert-light text-center py-4 mt-2">
    <i class="bi bi-file-earmark-text fs-4 mb-2"></i>
    <p class="mb-0 text-muted fs-7">暂无文章数据</p>
  </div>

  <!-- 文章列表 -->
  <div v-else class="article-list-container mt-2 grid-article-list">
    <!-- 先显示置顶文章 -->
    <div 
      v-for="article in sortedArticleList.filter(article => article.top === 1)" 
      :key="`sticky-${article.id}`"
      class="card article-item-card shadow-sm hover-shadow"
      :class="{'sticky-article': article.top === 1}"
      @click="toArticleDetail(article.id)" 
      style="cursor: pointer;"
    >
      <!-- 置顶标识 -->
      <div class="sticky-badge" v-if="article.top === 1">
        <i class="bi bi-pin-angle-fill"></i> 置顶
      </div>
      <div class="card-body p-0 d-flex flex-column h-100">
        <!-- 文章封面 -->
        <div class="article-cover flex-shrink-0">
          <img 
            :src="getCoverImg(article)" 
            :alt="article.title" 
            class="article-cover-img w-100 h-100 object-cover"
            loading="lazy"
          >
        </div>
        <!-- 内容区 -->
        <div class="article-content p-2 flex-grow-1 d-flex flex-column">
          <!-- 文章标题 -->
          <h3 class="article-title fw-bold mb-1 m-0">
            <span v-if="article.top === 1" class="sticky-icon-inline me-1">
              <i class="bi bi-pin-angle-fill text-warning"></i>
            </span>
            {{ article.title }}
          </h3>

          <!-- 文章摘要 -->
          <p class="article-desc text-truncate-1 mt-auto mb-1">
            {{ article.abstract || '暂无摘要' }}
          </p>

          <!-- 元信息 -->
          <div class="article-meta d-flex align-items-center w-100 m-0">
            <div class="meta-left d-flex align-items-center gap-0.5">
              <span class="meta-item"><i class="bi bi-folder-fill"></i>{{ article?.result?.group?.[0]?.name || '未分类' }}</span>
            </div>
            <div class="meta-right d-flex align-items-center gap-0.5 ms-auto">
              <span class="meta-item"><i class="bi bi-calendar-fill"></i>{{ formatTime(article.create_time) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 再显示非置顶文章 -->
    <div 
      v-for="article in sortedArticleList.filter(article => article.top !== 1)" 
      :key="article.id"
      class="card article-item-card shadow-sm hover-shadow"
      @click="toArticleDetail(article.id)" 
      style="cursor: pointer;"
    >
      <div class="card-body p-0 d-flex flex-column h-100">
        <!-- 文章封面 -->
        <div class="article-cover flex-shrink-0">
          <img 
            :src="getCoverImg(article)" 
            :alt="article.title" 
            class="article-cover-img w-100 h-100 object-cover"
            loading="lazy"
          >
        </div>
        <!-- 内容区 -->
        <div class="article-content p-2 flex-grow-1 d-flex flex-column">
          <!-- 文章标题 -->
          <h3 class="article-title fw-bold mb-1 m-0">{{ article.title }}</h3>

          <!-- 文章摘要 -->
          <p class="article-desc text-truncate-1 mt-auto mb-1">
            {{ article.abstract || '暂无摘要' }}
          </p>

          <!-- 元信息 -->
          <div class="article-meta d-flex align-items-center w-100 m-0">
            <div class="meta-left d-flex align-items-center gap-0.5">
              <span class="meta-item"><i class="bi bi-folder-fill"></i>{{ article?.result?.group?.[0]?.name || '未分类' }}</span>
            </div>
            <div class="meta-right d-flex align-items-center gap-0.5 ms-auto">
              <span class="meta-item"><i class="bi bi-calendar-fill"></i>{{ formatTime(article.create_time) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 加载更多 -->
  <div class="d-flex justify-content-center mt-4 mb-5">
    <button 
      v-if="loading && articleList.length > 0" 
      class="btn btn-info btn-sm disabled"
      disabled
    >
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      加载中...
    </button>
    <button 
      v-else-if="hasMore" 
      class="btn btn-primary btn-sm"
      @click="loadMore"
    >
      加载更多
    </button>
    <button 
      v-else 
      class="btn btn-outline-secondary btn-sm disabled"
      disabled
    >
      已加载全部
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request' 
// 导入公告组件
import INotice from '@/comps/custom/i-notice.vue'
const router = useRouter()

const articleList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const limit = ref(9)
const total = ref(0)
const order = ref('top desc, create_time desc') // 修改：先按置顶排序，再按时间排序

const hasMore = computed(() => {
  return articleList.value.length < total.value
})

// 计算排序后的文章列表：置顶文章在前
const sortedArticleList = computed(() => {
  // 注意：因为API已经按top desc排序了，这里可以直接返回articleList
  // 但为了确保逻辑清晰，我们还是显式处理一下
  return [...articleList.value].sort((a, b) => {
    // 首先按置顶状态排序：1 > 0
    if (a.top !== b.top) {
      return b.top - a.top // 置顶的在前
    }
    // 如果置顶状态相同，按创建时间排序（最新的在前）
    return new Date(b.create_time * 1000) - new Date(a.create_time * 1000)
  })
})

const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return '未知时间'
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const getCoverImg = (article) => {
  if (article.covers && article.covers.trim() !== '') {
    return article.covers
  }
  const randomNum = Math.floor(Math.random() * 1000000)
  const apiParams = new URLSearchParams({
    id: `${article.id}-${randomNum}`,
    size: '300x200',
    mode: 'fit',
    redirect: false
  })
  return `/api/file/rand?${apiParams.toString()}`
}

const getArticleList = async (page = 1, isLoadMore = false) => {
  loading.value = true
  try {
    const params = { page, limit: limit.value, order: order.value } // order已改为'创建时间 desc'
    const res = await request.get('/api/article/all', params)
    if (res.code === 200) {
      const newData = res.data.data || []
      const totalCount = res.data.count || 0
      articleList.value = isLoadMore ? [...articleList.value, ...newData] : newData
      total.value = totalCount
      currentPage.value = page
    } else {
      console.error('获取文章列表失败：', res.msg)
      !isLoadMore && (articleList.value = [])
    }
  } catch (error) {
    console.error('获取文章列表接口异常：', error)
    !isLoadMore && (articleList.value = [])
  } finally {
    loading.value = false
  }
}

const toArticleDetail = (id) => {
  router.push(`/archives/${id}`) 
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  getArticleList(currentPage.value + 1, true)
}

onMounted(() => {
  getArticleList(1, false)
})
</script>

<style scoped>
/* 文章列表Grid布局 */
.grid-article-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 置顶文章特殊样式 */
.sticky-article {
  border-top: 3px solid #ffc107; /* 顶部金色边框 */
}

/* 置顶徽章 */
.sticky-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #ffc107, #ff9800);
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 12px;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 2px;
}

.sticky-badge .bi {
  font-size: 0.7rem;
}

/* 标题内的置顶图标 */
.sticky-icon-inline {
  display: inline-flex;
  align-items: center;
}

/* 封面 */
.article-cover {
  width: 100%;
  padding-top: 66.67%;
  position: relative;
}
.article-cover-img {
  position: absolute;
  top: 0;
  left: 0;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

/* 内容区 */
.article-content {
  height: 100%;
}

/* 图片样式 */
img {
  transition: var(--transition-all); 
  max-width: 100%;
  height: auto;
  border-radius: var(--border-radius-md);
}

img:hover {
  filter: blur(0) brightness(0.95);
  -webkit-filter: blur(0) brightness(0.95);
}

/* 标题 */
.article-title {
  font-size: clamp(0.9rem, 1.2vw, 1rem);
  line-height: 1.4;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 摘要 */
.article-desc {
  font-size: 0.75rem;
  color: #6c757d;
  line-height: 1.5;
  margin: 0;
}
.text-truncate-1 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 元信息 */
.article-meta {
  font-size: 0.7rem;
  color: #868e96;
  line-height: 1.2;
}
.meta-left, .meta-right {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.meta-item {
  position: relative;
  display: flex;
  align-items: center;
  white-space: nowrap;
  padding-left: 0 !important;
}
.meta-item .bi {
  font-size: 0.9em;
  margin-right: 0.2rem;
  line-height: 1;
  vertical-align: middle;
  color: #9ca3af;
}

/* 响应式 */
@media (max-width: 768px) {
  .grid-article-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }
  .article-item-card {
    min-width: 160px;
  }
  .article-content {
    padding: 1.5px;
  }
  .sticky-badge {
    font-size: 0.65rem;
    padding: 2px 6px;
  }
}

@media (max-width: 576px) {
  .hover-shadow:hover {
    transform: translateY(-1px);
  }
  .article-title {
    font-size: 1rem;
  }
  .article-meta {
    font-size: 0.75rem;
  }
}
</style>