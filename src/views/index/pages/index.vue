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
            :src="loadingGif" 
            :data-src="getCoverImg(article)" 
            :alt="article.title" 
            class="article-cover-img w-100 h-100 object-cover lazy-img"
            @load="onImageLoad"
            @error="handleImageError"
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
            :src="loadingGif" 
            :data-src="getCoverImg(article)" 
            :alt="article.title" 
            class="article-cover-img w-100 h-100 object-cover lazy-img"
            @load="onImageLoad"
            @error="handleImageError"
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
      class="btn btn-info btn-lg disabled"
      disabled
    >
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      加载中...
    </button>
    <button 
      v-else-if="hasMore" 
      class="btn btn-primary btn-lg"
      @click="loadMore"
    >
      加载更多
    </button>
    <button 
      v-else 
      class="btn btn-outline-secondary btn-lg disabled"
      disabled
    >
      已加载全部
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request' 
// 导入公告组件
import INotice from '@/comps/custom/i-notice.vue'

// 导入本地图片
import defaultCover from '@/assets/img/fm.avif'
import loadingGif from '@/assets/img/ljz.gif'

const router = useRouter()

const articleList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const limit = ref(9)
const total = ref(0)
const order = ref('top desc, create_time desc')

const hasMore = computed(() => {
  return articleList.value.length < total.value
})

// 计算排序后的文章列表：置顶文章在前
const sortedArticleList = computed(() => {
  return [...articleList.value].sort((a, b) => {
    if (a.top !== b.top) {
      return b.top - a.top // 置顶的在前
    }
    return new Date(b.create_time * 1000) - new Date(a.create_time * 1000)
  })
})

const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return '未知时间'
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取封面图片
const getCoverImg = (article) => {
  // 1. 优先使用文章自身封面
  if (article.covers && article.covers.trim() !== '') {
    return article.covers
  }
  
  // 2. 使用导入的本地默认封面图片
  return defaultCover
}

// 图片加载成功处理
const onImageLoad = (event) => {
  const img = event.target
  // 移除loading样式
  img.classList.remove('lazy-loading')
  img.classList.add('lazy-loaded')
}

// 图片加载失败处理
const handleImageError = (event) => {
  const img = event.target
  // 移除loading样式
  img.classList.remove('lazy-loading')
  
  // 尝试加载默认图片
  const articleId = img.dataset.id
  
  // 如果当前src不是默认图片，则尝试加载默认图片
  if (img.src !== defaultCover) {
    img.src = defaultCover
  } else {
    // 如果默认图片也加载失败，显示错误状态
    img.classList.add('lazy-error')
  }
  
  // 防止无限错误循环
  img.onerror = null
}

// Intersection Observer 用于懒加载
let observer = null

// 初始化观察者
const initIntersectionObserver = () => {
  if (!('IntersectionObserver' in window)) {
    // 浏览器不支持 IntersectionObserver，回退到立即加载
    loadAllImages()
    return
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        const dataSrc = img.dataset.src
        
        if (dataSrc) {
          // 开始加载实际图片
          img.src = dataSrc
          img.classList.add('lazy-loading')
          observer.unobserve(img)
        }
      }
    })
  }, {
    rootMargin: '50px 0px', // 提前50px开始加载
    threshold: 0.1
  })
}

// 观察所有懒加载图片
const observeLazyImages = () => {
  nextTick(() => {
    const lazyImages = document.querySelectorAll('.lazy-img:not([data-observed])')
    lazyImages.forEach(img => {
      if (observer) {
        observer.observe(img)
        img.dataset.observed = 'true'
      }
    })
  })
}

// 加载所有图片（回退方案）
const loadAllImages = () => {
  const lazyImages = document.querySelectorAll('.lazy-img')
  lazyImages.forEach(img => {
    const dataSrc = img.dataset.src
    if (dataSrc) {
      img.src = dataSrc
    }
  })
}

// 手动触发加载（用于特殊情况下）
const loadVisibleImages = () => {
  // 移除滚动事件的调用，避免重复加载
}

const getArticleList = async (page = 1, isLoadMore = false) => {
  loading.value = true
  try {
    const params = { page, limit: limit.value, order: order.value }
    const res = await request.get('/api/article/all', params)
    
    if (res.code === 200) {
      const newData = res.data.data || []
      const totalCount = res.data.count || 0
      
      articleList.value = isLoadMore ? [...articleList.value, ...newData] : newData
      total.value = totalCount
      currentPage.value = page
      
      // 数据更新后，观察新图片
      if (!isLoadMore) { // 只在第一次加载时重新观察
        observeLazyImages()
      } else {
        // 加载更多时观察新添加的图片
        observeLazyImages()
      }
    } else {
      // console.error('获取文章列表失败：', res.msg)
      !isLoadMore && (articleList.value = [])
    }
  } catch (error) {
    // console.error('获取文章列表接口异常：', error)
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
  // 初始化Intersection Observer
  initIntersectionObserver()
  
  // 获取文章列表
  getArticleList(1, false)
})

onUnmounted(() => {
  // 清理观察者
  if (observer) {
    observer.disconnect()
    observer = null
  }
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
  border-top: 3px solid #ffc107;
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

/* 封面容器 */
.article-cover {
  width: 100%;
  padding-top: 66.67%;
  position: relative;
  overflow: hidden;
  background-color: #f8f9fa; /* 加载时的背景色 */
}

/* 懒加载图片样式 */
.article-cover-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  transition: all 0.3s ease;
}

/* 加载中的图片样式 */
.article-cover-img.lazy-loading {
  filter: blur(5px);
  opacity: 0.7;
  transform: scale(1.02);
}

/* 加载完成的图片样式 */
.article-cover-img.lazy-loaded {
  filter: blur(0);
  opacity: 1;
  animation: fadeIn 0.5s ease;
}

/* 加载失败的图片样式 */
.article-cover-img.lazy-error {
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
}

.article-cover-img.lazy-error::after {
  content: '图片加载失败';
  font-size: 0.7rem;
  color: #868e96;
}

/* 内容区 */
.article-content {
  height: 100%;
}

/* 图片样式 */
img {
  transition: all 0.3s ease;
  max-width: 100%;
  height: auto;
}

.article-cover-img:hover {
  transform: scale(1.03);
  filter: brightness(0.95);
}

/* 标题 */
.article-title {
  font-size: clamp(0.9rem, 1.2vw, 1rem);
  line-height: 1.4;
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
  .grid-article-list {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .article-item-card:hover {
    transform: translateY(-2px);
  }
  
  .article-title {
    font-size: 1rem;
  }
  
  .article-meta {
    font-size: 0.75rem;
  }
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0.7;
    filter: blur(5px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 如果gif路径不对，可以使用纯CSS加载动画 */
.article-cover-img:not([src]) {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}
</style>