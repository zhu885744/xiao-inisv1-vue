<template>
  <div class="category-page-wrapper">
    <!-- 加载状态 -->
    <div v-if="loading">
      <!-- 分类信息卡片骨架 -->
      <div class="category-info card shadow-sm p-4 mt-2">
        <div class="category-info-inner">
          <!-- 分类头像骨架 -->
          <div class="category-info-avatar">
            <div class="skeleton skeleton-avatar"></div>
          </div>
          <!-- 分类信息骨架 -->
          <div class="category-info-content">
            <div class="skeleton skeleton-category-title mb-3"></div>
            <div class="skeleton skeleton-category-description mb-4"></div>
          </div>
        </div>
      </div>
      
      <!-- 文章列表骨架 -->
      <div :class="['article-list-container mt-2', hasImageMode ? 'grid-article-list' : 'list-article-list']">
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
      
      <!-- 分页骨架 -->
      <div class="pagination-container mt-4">
        <div class="skeleton skeleton-pagination"></div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="card shadow-sm mt-2">
      <p class="mb-0 fw-normal">{{ errorMsg }}</p>
    </div>

    <!-- 分类页面主体 -->
    <div v-else class="category-main">
      <!-- 分类信息卡片 -->
      <div class="category-info card shadow-sm mt-2 rounded-3">
        <div class="category-info-inner">
          <!-- 分类头像 -->
          <div class="category-info-avatar">
            <img 
                :src="categoryInfo.avatar || defaultCover" 
                :alt="categoryInfo.name"
                class="category-info-avatar-img rounded-3"
                @error="handleImageError"
              >
          </div>
          <!-- 分类信息 -->
          <div class="category-info-content">
            <h1 class="category-title fw-bold mb-3">{{ categoryInfo.name }} <span class="text-sm text-muted">({{ articleCount }})</span></h1>
            <p v-if="categoryInfo.description" class="category-description text-muted mb-4">
              {{ categoryInfo.description }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- 文章列表 -->
      <div :class="['article-list-container mt-2', hasImageMode ? 'grid-article-list' : 'list-article-list']">
        <div v-if="articles.length === 0" class="card shadow-sm p-4 text-center col-12">
          <i class="bi bi-file-earmark-text text-muted fs-3 mb-2"></i>
          <p class="mb-0 text-muted">该分类下暂无文章</p>
        </div>
        <div 
          v-for="article in articles" 
          :key="article.id" 
          :class="[
            'card', 
            hasImageMode ? 'article-item-card shadow-sm hover-shadow' : 'article-item-list shadow-sm hover-shadow mt-2'
          ]"
          @click="goToArticle(article.id)"
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
                loading="lazy"
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
                  <span class="meta-item"><i class="bi bi-calendar-fill"></i>{{ formatTime(article.publish_time) }}</span>
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
                <span class="text-sm text-secondary"><i class="bi bi-calendar-fill me-1"></i>{{ formatTime(article.publish_time) }}</span>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '@/utils/request'
import cache from '@/utils/cache'

// 导入本地图片
import defaultCover from '@/assets/img/fm.avif'
import loadingGif from '@/assets/img/ljz.gif'
import { useCommStore } from '@/store/comm'
import { usePageTitle } from '@/utils/usePageTitle'

// 图片缓存
const imageCache = new Set()

// 存储
const store = {
  comm: useCommStore()
};

const router = useRouter()
const route = useRoute()

// 页面标题管理
const { setDynamicTitle } = usePageTitle()
setDynamicTitle('加载中...')

// 响应式状态
const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')
const categoryInfo = ref({})
const articles = ref([])
const currentPage = ref(1)
const total = ref(0)
const limit = ref(10)
const articleCount = ref(0)
// 显示模式：true为有图模式（网格布局），false为无图模式（列表布局）
const hasImageMode = ref(true)

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

// Intersection Observer 用于懒加载
let observer = null

// 计算属性
const pageCount = computed(() => {
  return Math.ceil(total.value / limit.value)
})



// 从路由参数获取分类ID
const getCurrentCategoryId = () => {
  return route.params.id
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return '未知时间'
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 跳转文章详情
const goToArticle = (articleId) => {
  // 验证文章ID是否为有效的正整数
  const validArticleId = parseInt(articleId)
  if (!isNaN(validArticleId) && validArticleId > 0) {
    router.push(`/archives/${validArticleId}`)
  } else {
    // console.error('文章ID不合法:', articleId)
  }
}

// 检查分类参数合法性
const checkCategoryParam = (param) => {
  const paramVal = String(param).trim()
  if (!paramVal) {
    errorMsg.value = '分类参数不能为空，请检查访问地址'
    return false
  }
  return true
}

// 获取封面图片 - 响应式处理
const getCoverImg = (article) => {
  // 1. 优先使用文章自身封面
  if (article.covers && article.covers.trim() !== '') {
    // 响应式图片处理
    const screenWidth = window.innerWidth
    const devicePixelRatio = window.devicePixelRatio || 1
    
    // 根据屏幕宽度和像素密度确定图片尺寸
    let imageSize = 'medium' // 默认中等尺寸
    
    if (screenWidth < 768) {
      // 移动设备
      imageSize = 'small'
    } else if (screenWidth < 1200) {
      // 平板设备
      imageSize = 'medium'
    } else {
      // 桌面设备
      imageSize = 'large'
    }
    
    // 如果像素密度高，使用更大的图片
    if (devicePixelRatio > 1.5) {
      if (imageSize === 'small') imageSize = 'medium'
      else if (imageSize === 'medium') imageSize = 'large'
    }
    
    // 这里假设图片URL支持通过参数调整尺寸
    // 如果后端支持，可以在这里修改URL来获取不同尺寸的图片
    // 例如: article.covers + '?size=' + imageSize
    // 目前暂时返回原始URL
    return article.covers
  }
  
  // 2. 使用导入的本地默认封面图片
  return defaultCover
}

// 图片加载成功处理
const onImageLoad = (event) => {
  const img = event.target
  const src = img.src
  
  // 添加到缓存
  if (src && !imageCache.has(src)) {
    imageCache.add(src)
  }
  
  // 使用requestAnimationFrame优化DOM操作，减少重绘
  requestAnimationFrame(() => {
    // 移除loading样式
    img.classList.remove('lazy-loading')
    img.classList.add('lazy-loaded')
    // 清理data-observed属性，释放内存
    delete img.dataset.observed
  })
}

// 图片加载失败处理
const handleImageError = (event) => {
  const img = event.target
  // 使用requestAnimationFrame优化DOM操作，减少重绘
  requestAnimationFrame(() => {
    // 移除loading样式
    img.classList.remove('lazy-loading')
    
    // 尝试加载默认图片
    if (img.src !== defaultCover) {
      img.src = defaultCover
    } else {
      // 如果默认图片也加载失败，显示错误状态
      img.classList.add('lazy-error')
    }
    
    // 防止无限错误循环
    img.onerror = null
    // 清理data-observed属性，释放内存
    delete img.dataset.observed
  })
}

// 预加载图片
const preloadImage = (src) => {
  if (!src) return
  
  // 检查缓存
  if (imageCache.has(src)) {
    return Promise.resolve()
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = src
    img.onload = () => {
      // 添加到缓存
      imageCache.add(src)
      resolve()
    }
    img.onerror = reject
  })
}

// Intersection Observer 用于懒加载
const initIntersectionObserver = () => {
  if (!('IntersectionObserver' in window)) {
    // 浏览器不支持 IntersectionObserver，回退到立即加载
    loadAllImages()
    return
  }

  // 根据屏幕尺寸动态调整rootMargin
  const screenHeight = window.innerHeight
  const rootMarginValue = `${Math.min(screenHeight * 0.5, 300)}px 0px ${Math.min(screenHeight * 0.3, 200)}px 0px`

  observer = new IntersectionObserver((entries) => {
    // 批量处理观察到的图片
    const imagesToLoad = []
    
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        const dataSrc = img.dataset.src
        
        if (dataSrc) {
          imagesToLoad.push(img)
        }
      }
    })
    
    // 根据网络状况调整批量加载大小
    let batchSize = 3
    if (navigator.connection) {
      const effectiveType = navigator.connection.effectiveType
      if (effectiveType === '4g') {
        batchSize = 5
      } else if (effectiveType === '3g') {
        batchSize = 3
      } else {
        batchSize = 2
      }
    }
    
    // 限制同时加载的图片数量，避免网络拥塞
    for (let i = 0; i < Math.min(imagesToLoad.length, batchSize); i++) {
      const img = imagesToLoad[i]
      // 开始加载实际图片
      img.src = img.dataset.src
      img.classList.add('lazy-loading')
      observer.unobserve(img)
    }
    
    // 剩余图片延迟加载，根据网络状况调整延迟时间
    if (imagesToLoad.length > batchSize) {
      let delay = 200
      if (navigator.connection) {
        const effectiveType = navigator.connection.effectiveType
        if (effectiveType === '4g') {
          delay = 100
        } else if (effectiveType === '3g') {
          delay = 200
        } else {
          delay = 300
        }
      }
      
      setTimeout(() => {
        for (let i = batchSize; i < imagesToLoad.length; i++) {
          const img = imagesToLoad[i]
          img.src = img.dataset.src
          img.classList.add('lazy-loading')
          observer.unobserve(img)
        }
      }, delay)
    }
  }, {
    rootMargin: rootMarginValue, // 动态调整预加载区域
    threshold: 0.01, // 只要有1%的区域可见就开始加载，提高响应速度
    root: null // 使用默认根元素（视口）
  })
}

// 观察所有懒加载图片
const observeLazyImages = () => {
  nextTick(() => {
    const lazyImages = document.querySelectorAll('.lazy-img:not([data-observed])')
    if (lazyImages.length > 0) {
      // 优先观察可视区域内的图片
      const visibleImages = Array.from(lazyImages).filter(img => {
        const rect = img.getBoundingClientRect()
        return rect.top < window.innerHeight + 300 && rect.bottom > -100
      })
      
      // 先观察可视区域内的图片
      visibleImages.forEach(img => {
        if (observer) {
          observer.observe(img)
          img.dataset.observed = 'true'
        }
      })
      
      // 预加载下一批图片（预加载策略）
      if (visibleImages.length > 0) {
        const nextImages = Array.from(lazyImages)
          .filter(img => !img.dataset.observed)
          .slice(0, 3) // 预加载接下来的3张图片
        
        nextImages.forEach(img => {
          const dataSrc = img.dataset.src
          if (dataSrc) {
            preloadImage(dataSrc).catch(() => {
              // 预加载失败不影响主流程
            })
          }
        })
      }
      
      // 延迟观察其他图片，减少初始加载压力
      setTimeout(() => {
        const remainingImages = Array.from(lazyImages).filter(img => !img.dataset.observed)
        remainingImages.forEach(img => {
          if (observer) {
            observer.observe(img)
            img.dataset.observed = 'true'
          }
        })
      }, 300) // 减少延迟时间，提高响应速度
    }
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

// 获取分类文章总数
const getCategoryArticleCount = async (categoryId) => {
  try {
    // 使用like参数获取分类文章总数，使用与文章列表相同的参数格式和传递方式
    const like = `Group|%7C${categoryId}%7C`;
    const apiUrl = `/api/article/count?like=${like}`;
    // console.log('分类文章总数请求URL:', apiUrl);
    // console.log('当前分类ID:', categoryId);
    // console.log('like参数:', like);
    
    const response = await request.get(apiUrl);
    
    if (response.code === 200) {
      articleCount.value = response.data || 0
      // console.log('分类文章总数:', articleCount.value)
    } else {
      articleCount.value = 0
      // console.error('获取分类文章总数失败:', response.msg)
    }
  } catch (err) {
    articleCount.value = 0
    // console.error('获取分类文章总数失败:', err)
  }
}

// 获取分类详情
const getCategoryDetail = async (categoryParam) => {
  loading.value = true
  error.value = false
  errorMsg.value = ''
  articleCount.value = 0
  try {
    // 缓存键
    const cacheKey = 'categories_list'
    const cacheExpire = 60 // 缓存60分钟
    
    // 尝试从缓存获取分类列表
    let categories = cache.get(cacheKey)
    
    // 如果缓存不存在，从API获取
    if (!categories) {
      let res = await request.get('/api/article-group/all', {
        cache: false
      })

      if (res.code === 200 && res.data && res.data.data && res.data.data.length > 0) {
        categories = res.data.data
        // 缓存分类列表
        cache.set(cacheKey, categories, cacheExpire)
      } else {
        error.value = true
        errorMsg.value = '获取分类列表失败'
        loading.value = false
        return
      }
    }

    // 根据key或id匹配分类
    let matchedCategory = null
    
    // 优先根据key匹配
    matchedCategory = categories.find(category => category.key === categoryParam)
    
    // 如果key匹配失败，尝试根据id匹配
    if (!matchedCategory) {
      matchedCategory = categories.find(category => category.id == categoryParam)
    }
    
    if (matchedCategory) {
      categoryInfo.value = matchedCategory
      // 获取分类文章总数
      await getCategoryArticleCount(matchedCategory.id)
      // 更新页面标题
      setDynamicTitle(matchedCategory.name)
    } else {
      error.value = true
      errorMsg.value = '未找到该分类，可能已被删除或参数错误'
      // 更新页面标题
      setDynamicTitle('分类不存在')
    }
  } catch (err) {
    error.value = true
    errorMsg.value = '网络异常，请检查网络后刷新页面'
    // console.error('获取分类详情失败:', err)
    // 更新页面标题
    setDynamicTitle('网络异常')
  } finally {
    loading.value = false
  }
}

// 获取分类下的文章列表 - 修复版
const getCategoryArticles = async (page = 1) => {
  try {
    // 使用带管道符的格式，确保能匹配到所有文章
    const like = `Group|%7C${categoryInfo.value.id}%7C`;
    // 添加审核筛选条件，只显示已审核的文章
    const apiUrl = `/api/article/all?like=${like}&where[audit]=1&page=${page}&limit=${limit.value}&order=create_time+desc&cache=false`;
    
    // console.log('修复版请求 URL:', apiUrl);
    // console.log('当前分类 ID:', categoryInfo.value.id);
    // console.log('like 参数:', like);
    
    const res = await request.get(apiUrl);

    if (res.code === 200) {
      // 调试：查看API返回的数据结构
      // console.log('API返回数据:', res);
      
      // 处理不同的数据结构
      if (res.data && res.data.data) {
        // 文章数组在data.data中
        articles.value = res.data.data;
        total.value = res.data.count || 0;
      } else if (res.data && Array.isArray(res.data)) {
        // 直接是文章数组
        articles.value = res.data;
        total.value = res.count || 0;
      } else {
        articles.value = [];
        total.value = 0;
      }
      // 数据更新后，观察新图片
      observeLazyImages();
    } else {
      articles.value = [];
      total.value = 0;
      // console.error('API返回错误:', res.msg);
    }
  } catch (err) {
    articles.value = [];
    total.value = 0;
    // console.error('获取分类文章失败:', err);
  }
};

// 切换分页
const changePage = (page) => {
  if (page < 1 || page > pageCount.value) return
  currentPage.value = page
  if (!error.value && categoryInfo.value && categoryInfo.value.id) {
    getCategoryArticles(page)
  }
}

// 初始化页面
const initPage = async (categoryParam) => {
  if (categoryParam && checkCategoryParam(categoryParam)) {
    await getCategoryDetail(categoryParam)
    if (!error.value) {
      await getCategoryArticles(currentPage.value)
    }
  } else {
    error.value = true
    loading.value = false
    errorMsg.value = '分类参数不合法'
  }
}

// 监听路由参数变化
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      // 清空之前的数据，避免旧数据残留
      categoryInfo.value = {}
      articles.value = []
      total.value = 0
      currentPage.value = 1
      error.value = false
      errorMsg.value = ''
      
      // 重新初始化页面，直接使用newId
      await initPage(newId)
    }
  },
  { immediate: false }
)

// 页面挂载初始化
onMounted(async () => {
  // 加载显示模式设置
  await loadDisplayMode()
  
  // 初始化Intersection Observer
  initIntersectionObserver()
  
  // 获取文章列表
  await initPage(getCurrentCategoryId())
})
</script>

<style scoped>
/* 骨架加载器样式 */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

/* 骨架加载器各部分尺寸 */
.skeleton-avatar {
  width: 100px;
  height: 100px;
  border-radius: 8px;
}

.skeleton-category-title {
  height: 2.5rem;
  width: 70%;
}

.skeleton-category-description {
  height: 1.1rem;
  width: 100%;
}

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

.skeleton-pagination {
  height: 2.5rem;
  width: 200px;
  margin: 0 auto;
  border-radius: 0.375rem;
}

/* 分类信息卡片 */
.category-info {
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.category-info:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.category-info-inner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding: 1.5rem;
}

/* 分类头像 */
.category-info-avatar {
  flex-shrink: 0;
  position: relative;
}

.category-info-avatar-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  border: 3px solid white;
}

.category-info-avatar-img:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* 分类信息内容 */
.category-info-content {
  flex-grow: 1;
  min-width: 0;
}

/* 分类标题 */
.category-title {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  line-height: 1.3;
  font-weight: 700;
  margin-bottom: 0.75rem !important;
  color: var(--bs-heading-color);
  transition: all 0.3s ease;
}

/* 分类描述 */
.category-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 0 !important;
  color: var(--bs-secondary-color);
  transition: all 0.3s ease;
}

/* 文章数量标签 */
.category-title .text-muted {
  font-size: 0.8em;
  font-weight: 400;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.category-title:hover .text-muted {
  opacity: 1;
  color: var(--bs-primary);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .category-info-inner {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .category-info-avatar-img {
    width: 80px;
    height: 80px;
  }
  
  .category-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  
  .category-description {
    font-size: 1rem;
  }
}

/* 文章列表Grid布局 - 有图模式 */
.grid-article-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 0 auto;
}

/* 文章卡片基础样式 */
.article-item-card,
.article-item-list {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border-radius: 0.75rem;
}

/* 文章卡片悬停效果 */
.article-item-card:hover,
.article-item-list:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 封面容器 */
.article-cover {
  width: 100%;
  padding-top: 66.67%;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef); /* 加载时的背景色 */
  border-radius: 0.75rem 0.75rem 0 0;
}

/* 懒加载图片样式 */
.article-cover-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s ease;
  border-radius: 0.75rem 0.75rem 0 0;
}

/* 加载中的图片样式 */
.article-cover-img.lazy-loading {
  filter: blur(8px);
  opacity: 0.6;
  transform: scale(1.05);
}

/* 加载完成的图片样式 */
.article-cover-img.lazy-loaded {
  filter: blur(0);
  opacity: 1;
  animation: fadeIn 0.6s ease-out;
}

/* 加载失败的图片样式 */
.article-cover-img.lazy-error {
  background: linear-gradient(135deg, #e9ecef, #dee2e6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #868e96;
  font-size: 1.5rem;
}

.article-cover-img.lazy-error::after {
  content: '📷';
  font-size: 2rem;
}

/* 内容区 */
.article-content {
  height: 100%;
  padding: 1.25rem !important;
}

/* 图片样式 */
img {
  transition: all 0.3s ease;
  max-width: 100%;
  height: auto;
}

.article-cover:hover .article-cover-img {
  transform: scale(1.08);
  filter: brightness(1.05);
}

/* 标题 */
.article-title {
  font-size: clamp(1.05rem, 1.5vw, 1.25rem);
  line-height: 1.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 700;
  color: #212529;
  transition: color 0.3s ease;
  margin-bottom: 0.75rem !important;
}

.article-item-card:hover .article-title {
  color: #007bff;
}

/* 摘要 */
.article-desc {
  font-size: 0.8rem;
  color: #6c757d;
  line-height: 1.4;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-truncate-1 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 无图模式标题 */
.article-title-list {
  font-size: clamp(1.25rem, 2.2vw, 1.6rem);
  line-height: 1.4;
  font-weight: 700;
  color: #212529;
  transition: color 0.3s ease;
  margin-bottom: 0.75rem !important;
}

.article-item-list:hover .article-title-list {
  color: #007bff;
}

/* 无图模式摘要 */
.article-desc-list {
  font-size: 0.95rem;
  color: #6c757d;
  line-height: 1.6;
  margin: 0.75rem 0 1.25rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 元信息 */
.article-meta {
  font-size: 0.75rem;
  color: #868e96;
  line-height: 1.3;
  margin-top: auto;
}

.meta-left, .meta-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.meta-item {
  position: relative;
  display: flex;
  align-items: center;
  white-space: nowrap;
  padding-left: 0 !important;
  transition: color 0.3s ease;
}

.meta-item:hover {
  color: #007bff;
}

.meta-item .bi {
  font-size: 0.9em;
  margin-right: 0.3rem;
  line-height: 1;
  vertical-align: middle;
  color: #9ca3af;
  transition: color 0.3s ease;
}

.meta-item:hover .bi {
  color: #007bff;
}

/* 无图模式元信息 */
.article-item-list .text-sm.text-secondary {
  transition: color 0.3s ease;
}

.article-item-list:hover .text-sm.text-secondary {
  color: #007bff;
}

.article-item-list:hover .text-sm.text-secondary .bi {
  color: #007bff;
}

/* 分页样式 */
.pagination-container {
  margin-top: 3rem;
  margin-bottom: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pagination {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.page-item {
  margin: 0;
}

.page-link {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 0.75rem;
  background: transparent;
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 2.5rem;
  text-align: center;
}

.page-link:hover:not(.disabled) {
  background: rgba(0, 123, 255, 0.1);
  color: #007bff;
  transform: translateY(-1px);
}

.page-item.active .page-link {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.4);
}

.page-item.disabled .page-link {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
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

/* 响应式调整 */
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
  
  .category-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  
  .category-description {
    font-size: 1rem;
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

/* 暗黑模式适配 */
[data-bs-theme=dark] {
  /* 分类信息卡片 */
  .category-info {
    background: linear-gradient(135deg, var(--bs-tertiary-bg), var(--bs-body-bg));
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .category-info:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  
  /* 分类头像 */
  .category-info-avatar-img {
    border-color: var(--bs-secondary-bg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .category-info-avatar-img:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }
  
  /* 分类标题和描述 */
  .category-title {
    color: var(--bs-heading-color);
  }
  
  .category-description {
    color: var(--bs-secondary-color);
  }
  
  /* 文章数量标签 */
  .category-title .text-muted {
    opacity: 0.7;
  }
  
  .category-title:hover .text-muted {
    opacity: 1;
    color: var(--bs-primary);
  }
  
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
  
  /* 悬停效果 */
  .article-item-card:hover,
  .article-item-list:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  /* 分页暗黑模式 */
  .pagination {
    background: var(--bs-body-bg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .page-link {
    color: var(--bs-secondary-color);
  }
  
  .page-link:hover:not(.disabled) {
    background: rgba(0, 123, 255, 0.2);
    color: var(--bs-primary);
  }
}

/* 响应式调整 */
@media (max-width: 992px) {
  .grid-article-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
}

@media (max-width: 768px) {
  .grid-article-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .article-item-card {
    min-width: 160px;
  }
  
  .article-content {
    padding: 1rem !important;
  }
  
  .article-title {
    font-size: 1rem;
    margin-bottom: 0.5rem !important;
  }
  
  .article-desc {
    font-size: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  .article-meta {
    font-size: 0.7rem;
  }
  
  /* 分页响应式 */
  .pagination-container {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
  
  .pagination {
    padding: 0.25rem;
  }
  
  .page-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
    min-width: 2rem;
  }
  
  .category-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  
  .category-description {
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .grid-article-list {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .article-item-card:hover {
    transform: translateY(-3px);
  }
  
  .article-title {
    font-size: 1.1rem;
  }
  
  .article-meta {
    font-size: 0.75rem;
  }
  
  .article-content {
    padding: 1.25rem !important;
  }
}
</style>