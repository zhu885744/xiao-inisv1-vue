<template>
  <!-- 轮播图 -->
  <div v-if="banners.length > 0" class="mt-2">
    <div id="carouselExampleControls" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-inner">
        <div 
          v-for="(banner, index) in banners" 
          :key="banner.id"
          class="carousel-item" 
          :class="{ active: index === 0 }"
        >
          <a :href="banner.url" :target="banner.target" class="d-block w-100">
            <img 
              :src="banner.image" 
              :alt="banner.title" 
              class="d-block w-100 carousel-img"
            >
          </a>
          <div v-if="banner.title" class="carousel-caption d-none d-md-block">
            <h5>{{ banner.title }}</h5>
          </div>
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
  </div>
  
  <!-- 首页公告模块 -->
  <i-notice /> 

  <!-- 排序选项 -->
  <div class="mt-2 mb-3">
    <div class="card shadow-sm p-3">
      <div class="d-flex flex-column">
        <div class="sort-tabs d-flex border rounded-lg overflow-hidden">
          <button 
            v-for="(option, index) in sortOptions" 
            :key="index"
            :class="['sort-tab-btn', { active: order === option.value }]"
            @click="setSortOption(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 加载状态 -->
  <div v-if="loading && articleList.length === 0" class="article-list-container mt-2">
    <!-- 骨架加载器 -->
    <div v-for="i in 6" :key="`skeleton-${i}`" :class="['card', hasImageMode ? 'article-item-card shadow-sm' : 'article-item-list shadow-sm mt-2']">
      <!-- 有图模式骨架 -->
      <div v-if="hasImageMode" class="card-body p-0 d-flex flex-column h-100">
        <!-- 封面骨架 -->
        <div class="article-cover flex-shrink-0">
          <div class="skeleton skeleton-cover"></div>
        </div>
        <!-- 内容骨架 -->
        <div class="article-content p-2 flex-grow-1 d-flex flex-column">
          <!-- 标题骨架 -->
          <div class="skeleton skeleton-title mb-1"></div>
          <!-- 摘要骨架 -->
          <div class="skeleton skeleton-desc mt-auto mb-1"></div>
          <!-- 元信息骨架 -->
          <div class="d-flex justify-content-between mt-2">
            <div class="skeleton skeleton-meta-left"></div>
            <div class="skeleton skeleton-meta-right"></div>
          </div>
        </div>
      </div>
      <!-- 无图模式骨架 -->
      <div v-else class="card-body p-2">
        <!-- 标题骨架 -->
        <div class="skeleton skeleton-title-list mb-2"></div>
        <!-- 摘要骨架 -->
        <div class="skeleton skeleton-desc-list mb-3"></div>
        <!-- 元信息骨架 -->
        <div class="d-flex justify-content-between">
          <div class="skeleton skeleton-meta-left"></div>
          <div class="skeleton skeleton-meta-right"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- 空数据状态 -->
  <div v-else-if="articleList.length === 0 && !loading" class="alert alert-light text-center py-4 mt-2">
    <p class="mb-0 text-muted fs-7">暂无文章数据</p>
  </div>

  <!-- 文章列表 -->
  <div v-else :class="['article-list-container mt-2', hasImageMode ? 'grid-article-list' : 'list-article-list']">
    <!-- 先显示置顶文章 -->
    <div 
      v-for="article in sortedArticleList.filter(article => article.top === 1)" 
      :key="`sticky-${article.id}`"
      :class="[
        'card', 
        hasImageMode ? 'article-item-card shadow-sm hover-shadow' : 'article-item-list shadow-sm hover-shadow mt-2',
        {'sticky-article': article.top === 1}
      ]"
      @click="toArticleDetail(article.id)" 
      style="cursor: pointer;"
    >
      <!-- 置顶标识 -->
      <div class="sticky-badge" v-if="article.top === 1">
        <i class="bi bi-pin-angle-fill"></i> 置顶
      </div>
      
      <!-- 有图模式布局 -->
      <div v-if="hasImageMode" class="card-body p-0 d-flex flex-column h-100">
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
      
      <!-- 无图模式布局 -->
      <div v-else class="card-body p-2">
        <!-- 文章标题 -->
        <h3 class="article-title-list h5 fw-bold mb-2">
          <span v-if="article.top === 1" class="me-2">
            <i class="bi bi-pin-angle-fill text-warning"></i>
          </span>
          {{ article.title }}
        </h3>

        <!-- 文章摘要 -->
        <p class="article-desc-list text-muted mb-3">
          {{ article.abstract || '暂无摘要' }}
        </p>

        <!-- 元信息 -->
        <div class="d-flex align-items-center justify-content-between w-100">
          <div class="d-flex align-items-center gap-3">
            <span class="text-sm text-secondary"><i class="bi bi-folder-fill me-1"></i>{{ article?.result?.group?.[0]?.name || '未分类' }}</span>
          </div>
          <div class="d-flex align-items-center gap-3">
            <span class="text-sm text-secondary"><i class="bi bi-calendar-fill me-1"></i>{{ formatTime(article.create_time) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 再显示非置顶文章 -->
    <div 
      v-for="article in sortedArticleList.filter(article => article.top !== 1)" 
      :key="article.id"
      :class="[
        'card', 
        hasImageMode ? 'article-item-card shadow-sm hover-shadow' : 'article-item-list shadow-sm hover-shadow mt-2'
      ]"
      @click="toArticleDetail(article.id)" 
      style="cursor: pointer;"
    >
      <!-- 有图模式布局 -->
      <div v-if="hasImageMode" class="card-body p-0 d-flex flex-column h-100">
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
      
      <!-- 无图模式布局 -->
      <div v-else class="card-body p-2">
        <!-- 文章标题 -->
        <h3 class="article-title-list h5 fw-bold mb-2">{{ article.title }}</h3>

        <!-- 文章摘要 -->
        <p class="article-desc-list text-muted mb-3">
          {{ article.abstract || '暂无摘要' }}
        </p>

        <!-- 元信息 -->
        <div class="d-flex align-items-center justify-content-between w-100">
          <div class="d-flex align-items-center gap-3">
            <span class="text-sm text-secondary"><i class="bi bi-folder-fill me-1"></i>{{ article?.result?.group?.[0]?.name || '未分类' }}</span>
          </div>
          <div class="d-flex align-items-center gap-3">
            <span class="text-sm text-secondary"><i class="bi bi-calendar-fill me-1"></i>{{ formatTime(article.create_time) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 分页 -->
  <div v-if="total > 0" class="pagination-container mt-4">
    <nav aria-label="Page navigation">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="changePage(currentPage - 1)">
            <span aria-hidden="true">&laquo;</span>
          </button>
        </li>
        <li class="page-item active">
          <span class="page-link">{{ currentPage }} / {{ pageCount }}</span>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === pageCount }">
          <button class="page-link" @click="changePage(currentPage + 1)">
            <span aria-hidden="true">&raquo;</span>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request' 
// 导入公告组件
import INotice from '@/comps/custom/i-notice.vue'
import { usePageTitle } from '@/utils/usePageTitle'

// 使用页面标题管理
const { setDynamicTitle } = usePageTitle();
setDynamicTitle('首页');

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
// 排序选项
const sortOptions = [
  { label: '最新发布', value: 'top desc, create_time desc' },
  { label: '最多浏览', value: 'views desc' },
  { label: '最新更新', value: 'update_time desc' },
  { label: '按 ID 排序', value: 'id asc' }
]
// 显示模式：true为有图模式（网格布局），false为无图模式（列表布局）
const hasImageMode = ref(true)
// 轮播图数据
const banners = ref([])

// 从后端API获取显示模式设置
const loadDisplayMode = async () => {
  try {
    const response = await request.get('/api/config/one', { key: 'xiao_functions' })
    if (response.code === 200 && response.data) {
      const config = response.data.json || {}
      hasImageMode.value = config.display_mode !== false // 默认值为true
    }
  } catch (error) {
    console.error('读取显示模式设置失败:', error)
    // 出错时使用默认值
    hasImageMode.value = true
  }
}

// 保存显示模式设置到后端API
const saveDisplayMode = async (mode) => {
  try {
    await request.post('/api/config/save', {
      key: 'xiao_functions',
      json: { display_mode: mode }
    })
  } catch (error) {
    console.error('保存显示模式设置失败:', error)
  }
}

// 监听显示模式变化
const changeDisplayMode = async (mode) => {
  hasImageMode.value = mode
  await saveDisplayMode(mode)
}

// 计算总页数
const pageCount = computed(() => {
  return Math.ceil(total.value / limit.value)
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

// 切换分页
const changePage = (page) => {
  if (page < 1 || page > pageCount.value) return
  currentPage.value = page
  getArticleList(page, false)
}

// 处理排序变化
const handleSortChange = () => {
  currentPage.value = 1
  getArticleList(1)
}

// 设置排序选项
const setSortOption = (value) => {
  order.value = value
  currentPage.value = 1
  getArticleList(1)
}

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

const getArticleList = async (page = 1) => {
  loading.value = true
  try {
    const params = { page, limit: limit.value, order: order.value }
    const res = await request.get('/api/article/all', params)
    
    if (res.code === 200) {
      const newData = res.data.data || []
      const totalCount = res.data.count || 0
      
      articleList.value = newData
      total.value = totalCount
      currentPage.value = page
      
      // 数据更新后，观察新图片
      observeLazyImages()
    } else {
      // console.error('获取文章列表失败：', res.msg)
      articleList.value = []
    }
  } catch (error) {
    // console.error('获取文章列表接口异常：', error)
    articleList.value = []
  } finally {
    loading.value = false
  }
}

const toArticleDetail = (id) => {
  router.push(`/archives/${id}`) 
}

// 获取轮播图数据
const getBanners = async () => {
  try {
    const res = await request.get('/api/banner/all', { limit: 5, order: 'create_time desc' })
    if (res.code === 200) {
      banners.value = res.data.data || []
    }
  } catch (error) {
    console.error('获取轮播图数据失败:', error)
    banners.value = []
  }
}

onMounted(async () => {
  // 加载显示模式设置
  await loadDisplayMode()
  
  // 初始化Intersection Observer
  initIntersectionObserver()
  
  // 获取轮播图数据
  getBanners()
  
  // 获取文章列表
  getArticleList(1)
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
/* 文章列表Grid布局 - 有图模式 */
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
  font-size: clamp(1rem, 1.4vw, 1.2rem);
  line-height: 1.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 摘要 */
.article-desc {
  font-size: 0.6rem;
  color: #6c757d;
  line-height: 1.3;
  margin: 0;
}

/* 无图模式标题 */
.article-title-list {
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  line-height: 1.4;
  font-weight: 700;
}

/* 无图模式摘要 */
.article-desc-list {
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.5;
  margin: 0.5rem 0;
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

/* 轮播图样式 */
.carousel-img {
  height: 400px;
  object-fit: cover;
  border-radius: 0.5rem;
}

.carousel-caption {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0.5rem;
  padding: 1rem;
}

/* 排序Tab样式 */
.sort-tabs {
  width: 100%;
  display: flex;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #f8f9fa;
}

.sort-tab-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  position: relative;
}

.sort-tab-btn:hover {
  background-color: rgba(0, 123, 255, 0.1);
  color: #007bff;
}

.sort-tab-btn.active {
  background-color: #007bff;
  color: white;
  font-weight: 600;
}

.sort-tab-btn:first-child {
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
}

.sort-tab-btn:last-child {
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

/* 分页样式 */
.pagination-container {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

/* 分页响应式设计 */
@media (max-width: 768px) {
  .pagination-container {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .page-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
  
  /* 轮播图响应式 */
  .carousel-img {
    height: 250px;
  }
}

@media (max-width: 576px) {
  /* 轮播图响应式 */
  .carousel-img {
    height: 200px;
  }
  
  .carousel-caption {
    padding: 0.5rem;
  }
  
  .carousel-caption h5 {
    font-size: 1rem;
  }
  
  /* 排序Tab响应式 */
  .sort-tab-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }
  
  @media (max-width: 360px) {
    .sort-tab-btn {
      padding: 0.3rem 0.5rem;
      font-size: 0.7rem;
    }
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

/* 骨架加载器样式 */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

/* 骨架加载器各部分尺寸 */
.skeleton-cover {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 0;
}

.skeleton-title {
  height: 1.2rem;
  width: 80%;
}

.skeleton-desc {
  height: 0.6rem;
  width: 100%;
}

.skeleton-meta-left {
  height: 0.7rem;
  width: 40%;
}

.skeleton-meta-right {
  height: 0.7rem;
  width: 30%;
}

.skeleton-title-list {
  height: 1.5rem;
  width: 90%;
}

.skeleton-desc-list {
  height: 0.9rem;
  width: 100%;
  margin-bottom: 0.5rem;
}

/* 暗黑模式适配 */
[data-bs-theme=dark] {
  /* 文章卡片 */
  .article-item-card,
  .article-item-list {
    background-color: var(--bs-body-bg);
    border-color: var(--bs-border-color);
  }
  
  /* 标题 */
  .article-title {
    color: var(--bs-heading-color);
  }
  
  /* 摘要 */
  .article-desc {
    color: var(--bs-secondary-color);
  }
  
  /* 无图模式标题 */
  .article-title-list {
    color: var(--bs-heading-color);
  }
  
  /* 无图模式摘要 */
  .article-desc-list {
    color: var(--bs-secondary-color);
  }
  
  /* 元信息 */
  .article-meta {
    color: var(--bs-tertiary-color);
  }
  
  .meta-item .bi {
    color: var(--bs-tertiary-color);
  }
  
  /* 加载动画 */
  .article-cover-img:not([src]) {
    background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
  }
  
  /* 骨架加载器暗黑模式 */
  .skeleton {
    background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
    background-size: 200% 100%;
  }
  
  /* 排序Tab暗黑模式 */
  .sort-tabs {
    border-color: var(--bs-border-color);
    background-color: var(--bs-body-bg);
  }
  
  .sort-tab-btn {
    color: var(--bs-secondary-color);
  }
  
  .sort-tab-btn:hover {
    background-color: rgba(0, 123, 255, 0.2);
    color: var(--bs-primary);
  }
  
  .sort-tab-btn.active {
    background-color: var(--bs-primary);
    color: white;
  }
  
  /* 悬停效果 */
  .article-item-card:hover,
  .article-item-list:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}
</style>