<template>
  <div class="author-page-wrapper">
    <!-- 加载状态 -->
    <div v-if="loading" class="card shadow-sm p-4 mt-2">
      <!-- 用户基本信息骨架 -->
      <div class="card-body user-basic-info mb-4">
        <div class="d-flex align-items-start gap-4 mb-4">
          <div class="position-relative">
            <div class="skeleton skeleton-avatar"></div>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex align-items-center gap-3 mb-2">
              <div class="skeleton skeleton-nickname"></div>
              <div class="skeleton skeleton-badge"></div>
              <div class="skeleton skeleton-badge"></div>
            </div>
            <!-- 个人网站骨架 -->
            <div class="skeleton skeleton-website mb-3 mt-3"></div>
            <!-- 用户信息骨架 -->
            <div class="d-flex align-items-center gap-4 flex-wrap text-sm mb-2">
              <div class="skeleton skeleton-info-item"></div>
              <div class="skeleton skeleton-info-item"></div>
            </div>
          </div>
        </div>

        <!-- 个人简介骨架 -->
        <div class="user-description mb-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
          <div class="skeleton skeleton-description"></div>
        </div>

        <!-- 用户标签骨架 -->
        <div class="user-tags mb-4">
          <div class="d-flex align-items-center gap-3 flex-wrap">
            <div class="skeleton skeleton-tag"></div>
            <div class="skeleton skeleton-tag"></div>
            <div class="skeleton skeleton-tag"></div>
            <div class="skeleton skeleton-tag"></div>
          </div>
        </div>
      </div>

      <!-- 用户等级信息骨架 -->
      <div class="user-level mb-5">
        <h6 class="mb-3 d-flex align-items-center gap-2 text-lg font-medium">
          <div class="skeleton skeleton-icon"></div>
          <div class="skeleton skeleton-section-title"></div>
        </h6>
        <div class="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="skeleton skeleton-level-label"></div>
            <div class="skeleton skeleton-level-value"></div>
          </div>
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="skeleton skeleton-level-label"></div>
            <div class="skeleton skeleton-level-value"></div>
          </div>
          <!-- 经验值进度条骨架 -->
          <div class="mb-1">
            <div class="d-flex justify-content-between mb-2">
              <div class="skeleton skeleton-progress-label"></div>
              <div class="skeleton skeleton-progress-value"></div>
            </div>
            <div class="skeleton skeleton-progress-bar"></div>
          </div>
          <!-- 等级描述骨架 -->
          <div class="mt-4">
            <div class="skeleton skeleton-level-description"></div>
          </div>
        </div>
      </div>

      <!-- 用户权限信息骨架 -->
      <div class="user-auth mb-5">
        <h6 class="mb-3 d-flex align-items-center gap-2 text-lg font-medium">
          <div class="skeleton skeleton-icon"></div>
          <div class="skeleton skeleton-section-title"></div>
        </h6>
        <div class="p-4 bg-gradient-to-r from-success/10 to-secondary/10 border border-success/20">
          <div class="mb-3">
            <div class="skeleton skeleton-auth-label"></div>
            <div class="d-flex gap-2 mt-2">
              <div class="skeleton skeleton-auth-badge"></div>
              <div class="skeleton skeleton-auth-badge"></div>
            </div>
          </div>
          <div>
            <div class="skeleton skeleton-auth-label"></div>
            <div class="mt-2">
              <div class="skeleton skeleton-auth-badge"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 交互按钮骨架 -->
      <div class="user-actions d-flex gap-2 flex-wrap">
        <div class="skeleton skeleton-button"></div>
        <div class="skeleton skeleton-button"></div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="card shadow-sm mt-2">
      <div class="card-body text-center py-10">
        <i class="bi bi-exclamation-circle text-danger fs-1"></i>
        <p class="mt-3 text-muted">{{ error }}</p>
        <button 
            @click="fetchUserInfo" 
            class="btn btn-sm btn-outline-secondary mt-3"
          >
            重试
          </button>
      </div>
    </div>

    <!-- 无数据状态 -->
    <div v-else-if="!userInfo" class="card shadow-sm mt-2">
      <div class="card-body text-center py-10">
        <i class="bi bi-person-x text-muted fs-1"></i>
        <p class="mt-3 text-muted">用户不存在</p>
      </div>
    </div>

    <!-- 用户信息内容 -->
    <div v-else>
      <!-- 顶部横幅区域 -->
      <div class="banner-wrapper mt-2 rounded-3 overflow-hidden shadow-sm">
        <!-- 背景图 -->
        <div class="banner-bg" :style="{ backgroundImage: `url(${userInfo.banner || defaultBanner})` }">
          <div class="banner-overlay"></div>
        </div>
        
        <!-- 用户信息卡片 -->
        <div class="user-card card border-0 shadow-lg mt-n8 relative z-10">
          <div class="card-body p-4">
            <div class="d-flex align-items-start gap-4 flex-wrap">
              <!-- 头像 -->
              <div class="position-relative flex-shrink-0 avatar-wrapper">
                <div class="avatar-container position-relative">
                  <img 
                    :src="userInfo.avatar || defaultAvatar" 
                    :alt="userInfo.nickname"
                    class="rounded-3 border-4 border-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    width="120"
                    height="120"
                    style="object-fit: cover;"
                    @error="handleAvatarError"
                  >
                  <div class="avatar-overlay rounded-3">
                    <div class="avatar-status" :class="{ 'online': userInfo.login_time && (Date.now() / 1000 - userInfo.login_time < 86400) }"></div>
                  </div>
                </div>
              </div>
              
              <!-- 用户基本信息 -->
              <div class="flex-grow-1 min-w-[200px]">
                <div class="d-flex align-items-center justify-between mb-2 flex-wrap gap-2">
                  <div class="d-flex align-items-center gap-3">
                    <h3 class="mb-0 fw-bold text-xl">{{ userInfo.nickname }}</h3>
                  </div>
                </div>
                
                <!-- 用户组标识 -->
                <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
                  <span v-for="(group, index) in userGroups" :key="index" class="badge text-bg-success px-3 py-1 text-sm">
                    {{ group.name }}
                  </span>
                  <!-- 用户等级 -->
                  <span v-if="userLevelInfo" class="badge text-bg-primary rounded-full px-3 py-1 text-sm font-medium">
                    Lv.{{ userLevelInfo.current.value }} {{ userLevelInfo.current.name }}
                  </span>
                </div>

                <!-- 个人网站 -->
                <div v-if="userInfo.json?.website?.url" class="mb-3">
                  <span class="text-muted">
                    <a 
                      :href="userInfo.json.website.url" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="d-flex align-items-center gap-2 text-decoration-none user-website"
                    >
                      <i class="bi bi-globe"></i>
                      <span class="truncate-url">{{ userInfo.json.website.name || userInfo.json.website.url }}</span>
                    </a>
                  </span>
                </div>

                <!-- 个人简介 -->
                <p class="text-muted mb-0 user-desc">
                  {{ userInfo.description || '这个人很懒，什么都没有留下！' }}
                </p>
              </div>
            </div>
            
            <!-- 统计信息栏 -->
            <div class="stats-bar border-top border-gray-100 mt-4 pt-4">
              <div class="row g-4">
                <div class="stat-item col">
                  <div v-if="statsLoading" class="stat-value">
                    <span class="spinner-border spinner-border-sm text-muted" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </span>
                  </div>
                  <div v-else class="stat-value fw-bold text-lg">{{ userStats.articleCount }}</div>
                  <div class="stat-label text-muted text-sm">文章</div>
                </div>
                <div class="stat-item col">
                  <div v-if="statsLoading" class="stat-value">
                    <span class="spinner-border spinner-border-sm text-muted" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </span>
                  </div>
                  <div v-else class="stat-value fw-bold text-lg">{{ userStats.collectCount }}</div>
                  <div class="stat-label text-muted text-sm">收藏</div>
                </div>
                <div class="stat-item col">
                  <div v-if="statsLoading" class="stat-value">
                    <span class="spinner-border spinner-border-sm text-muted" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </span>
                  </div>
                  <div v-else class="stat-value fw-bold text-lg">{{ userStats.likeCount }}</div>
                  <div class="stat-label text-muted text-sm">点赞</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-wrapper mt-2">
        <!-- 文章列表卡片 -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-transparent border-0 pt-3 px-3">
            <h5 class="fw-bold mb-0">
              <i class="bi bi-file-text me-2"></i> 发布 
              <span class="badge text-bg-secondary ms-1">{{ articleCount }}</span>
            </h5>
          </div>
          <div class="card-body p-3">
            <!-- 文章列表 -->
            <div v-if="articles.length === 0" class="text-center py-5">
              <i class="bi bi-file-earmark-text text-muted fs-1 mb-2 d-block"></i>
              <p class="mb-0 text-muted">暂无文章</p>
            </div>
            <div 
              v-for="article in articles" 
              :key="article.id" 
              class="card article-item-card shadow-sm mt-3 overflow-hidden"
              @click="goToArticle(article.id)"
            >
              <div class="card-body p-0">
                <div class="row g-0 flex-column flex-md-row">
                  <!-- 文章封面 -->
                  <div class="article-cover-container col-md-4 flex-shrink-0">
                    <img 
                      :src="article.covers || defaultCover" 
                      :alt="article.title"
                      class="article-cover-img w-100"
                    >
                  </div>
                  <!-- 文章内容 -->
                  <div class="col-md-8 p-3 flex-grow-1 d-flex flex-column">
                    <h3 class="article-title fw-bold mb-2 flex-shrink-0">{{ article.title }}</h3>
                    <p class="article-desc text-muted text-sm mb-3 flex-grow-1">{{ article.abstract || '暂无摘要' }}</p>
                    <div class="d-flex align-items-center justify-content-between text-sm text-muted flex-shrink-0">
                      <span class="article-category">{{ article?.result?.group?.[0]?.name || '未分类' }}</span>
                      <span class="article-date">{{ formatDate(article.publish_time) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 文章分页 -->
            <div v-if="articleTotalPages > 1" class="d-flex justify-content-center mt-4">
              <nav>
                <ul class="pagination mb-0">
                  <li class="page-item" :class="{ disabled: currentArticlePage <= 1 }">
                    <a class="page-link" href="#" @click.prevent="changeArticlePage(currentArticlePage - 1)">
                      <i class="bi bi-chevron-left"></i>
                    </a>
                  </li>
                  <li 
                    v-for="page in visibleArticlePages" 
                    :key="page" 
                    class="page-item"
                    :class="{ active: page === currentArticlePage, disabled: page === '...' }"
                  >
                    <a class="page-link" href="#" @click.prevent="page !== '...' && changeArticlePage(page)">
                      {{ page }}
                    </a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentArticlePage >= articleTotalPages }">
                    <a class="page-link" href="#" @click.prevent="changeArticlePage(currentArticlePage + 1)">
                      <i class="bi bi-chevron-right"></i>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'
import toast from '@/utils/toast'
import cache from '@/utils/cache'
import defaultAvatar from '@/assets/img/avatar.png'
import defaultBanner from '@/assets/img/fm.avif'
import defaultCover from '@/assets/img/fm.avif'
import { useCommStore } from '@/store/comm'
import { usePageTitle } from '@/utils/usePageTitle'

// 使用页面标题管理
const { setDynamicTitle } = usePageTitle();

const route = useRoute()
const router = useRouter()
const store = useCommStore()

// 环境变量网站标题，兜底处理
const SITE_TITLE = import.meta.env.VITE_TITLE || '朱某的生活印记'

// 获取网站标题的方法
const getSiteTitle = () => {
  return store.siteInfo?.title || SITE_TITLE
}

// 响应式数据
const loading = ref(false)
const error = ref('')
const userInfo = ref(null)
const articles = ref([])
const articleCount = ref(0)
const currentArticlePage = ref(1)
const articleTotalPages = ref(1)

// 用户统计数据
const userStats = ref({
  articleCount: 0,
  collectCount: 0,
  likeCount: 0
})
const statsLoading = ref(false)

// 定时器引用
const refreshInterval = ref(null)

// 计算属性
// 用户ID从路由参数获取
const userId = computed(() => {
  return route.params.id || 1
})

// 是否为管理员
const isAdmin = computed(() => {
  if (!userInfo.value || !userInfo.value.result?.auth) return false
  return userInfo.value.result.auth.all || 
    (userInfo.value.result.auth.group?.list && 
     userInfo.value.result.auth.group.list.some(group => group.key === 'admin'))
})

// 用户等级信息
const userLevelInfo = computed(() => {
  return userInfo.value?.result?.level
})

// 用户权限信息
const userAuthInfo = computed(() => {
  return userInfo.value?.result?.auth
})

// 用户组信息
const userGroups = computed(() => {
  if (!userAuthInfo.value) {
    return [{ name: '普通用户' }]
  }
  
  if (userAuthInfo.value.group?.list && userAuthInfo.value.group.list.length > 0) {
    return userAuthInfo.value.group.list
  }
  
  return [{ name: '普通用户' }]
})

// 方法
// 获取用户信息（带缓存）
const fetchUserInfo = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const cacheKey = `author_user_info_${userId.value}`
    const cacheExpire = 30
    
    const cachedUserInfo = cache.get(cacheKey)
    if (cachedUserInfo) {
      userInfo.value = cachedUserInfo
      loading.value = false
      return
    }
    
    const res = await request.get('/api/users/one', {
      id: userId.value
    })
    
    if (res.code === 200 && res.data) {
      userInfo.value = res.data
      cache.set(cacheKey, res.data, cacheExpire)
    } else {
      error.value = res.msg || '获取用户信息失败'
      userInfo.value = null
    }
  } catch (err) {
    error.value = '网络错误，请稍后重试'
    userInfo.value = null
  } finally {
    loading.value = false
  }
}

// 获取用户文章列表
const fetchUserArticles = async () => {
  try {
    if (!userId.value) return
    
    const currentUserId = userId.value
    
    const whereParam = JSON.stringify({ uid: currentUserId, audit: 1 })
    const countWhereParam = JSON.stringify({ uid: currentUserId, audit: 1 })
    
    const [articlesRes, countRes] = await Promise.all([
      request.get('/api/article/all', {
        where: whereParam,
        page: currentArticlePage.value,
        limit: 10,
        order: 'create_time desc'
      }),
      request.get('/api/article/count', {
        where: countWhereParam
      })
    ])
    
    if (articlesRes.code === 200) {
      if (articlesRes.data && articlesRes.data.data) {
        articles.value = articlesRes.data.data
        articleCount.value = articlesRes.data.count || 0
      } else if (articlesRes.data && Array.isArray(articlesRes.data)) {
        articles.value = articlesRes.data
        articleCount.value = articlesRes.count || 0
      } else {
        articles.value = []
        articleCount.value = 0
      }
    } else {
      articles.value = []
      articleCount.value = 0
    }
    
    if (countRes.code === 200) {
      const count = countRes.data?.count ?? countRes.count ?? countRes.data ?? 0
      articleCount.value = count
      articleTotalPages.value = Math.ceil(count / 10) || 1
    }
  } catch (err) {
    articles.value = []
    articleCount.value = 0
  }
}

// 计算可见的页码
const visibleArticlePages = computed(() => {
  const total = articleTotalPages.value
  const current = currentArticlePage.value
  const pages = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

// 切换文章页码
const changeArticlePage = (page) => {
  if (page < 1 || page > articleTotalPages.value) return
  currentArticlePage.value = page
  fetchUserArticles()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 获取用户文章数量
const getArticleCount = async (userId) => {
  try {
    const whereParam = JSON.stringify({ uid: userId })
    const response = await request.get('/api/article/count', {
      where: whereParam
    })
    if (response.code === 200) {
      return response.data
    }
    return 0
  } catch (error) {
    return 0
  }
}

// 获取用户收藏数量
const getCollectCount = async (userId) => {
  try {
    const whereParam = JSON.stringify({ uid: userId, type: 'collect', state: 1 })
    const response = await request.get('/api/exp/count', {
      where: whereParam
    })
    if (response.code === 200) {
      return response.data
    }
    return 0
  } catch (error) {
    return 0
  }
}

// 获取用户点赞数量
const getLikeCount = async (userId) => {
  try {
    const whereParam = JSON.stringify({ uid: userId, type: 'like', state: 1 })
    const response = await request.get('/api/exp/count', {
      where: whereParam
    })
    if (response.code === 200) {
      return response.data
    }
    return 0
  } catch (error) {
    return 0
  }
}

// 初始化用户统计数据
const initUserStats = async () => {
  if (!userId.value) return
  
  const cacheKey = `author_user_stats_${userId.value}`
  const cacheExpire = 10
  
  const cachedData = cache.get(cacheKey)
  if (cachedData) {
    userStats.value = cachedData
    return
  }
  
  statsLoading.value = true
  try {
    const [articleCountData, collectCount, likeCount] = await Promise.all([
      getArticleCount(userId.value),
      getCollectCount(userId.value),
      getLikeCount(userId.value)
    ])
    
    userStats.value = {
      articleCount: articleCountData,
      collectCount,
      likeCount
    }
    
    cache.set(cacheKey, userStats.value, cacheExpire)
  } catch (error) {
    userStats.value = {
      articleCount: 0,
      collectCount: 0,
      likeCount: 0
    }
  } finally {
    statsLoading.value = false
  }
}

// 跳转到文章详情
const goToArticle = (articleId) => {
  const validArticleId = parseInt(articleId)
  if (!isNaN(validArticleId) && validArticleId > 0) {
    router.push(`/archives/${validArticleId}`)
  }
}

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '未知时间'
  
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 处理头像错误
const handleAvatarError = (event) => {
  event.target.src = defaultAvatar
}

// 设置页面标题
const setPageTitle = (nickname) => {
  if (nickname) {
    document.title = `${nickname} - ${getSiteTitle()}`
  } else {
    document.title = `用户主页 - ${getSiteTitle()}`
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
  fetchUserArticles()
  initUserStats()
  
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
})

// 组件卸载时恢复原始页面标题并清除定时器
onUnmounted(() => {
  document.title = getSiteTitle()
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
})

// 监听用户信息变化，更新页面标题
watch(
  () => userInfo.value,
  (newUserInfo) => {
    if (newUserInfo) {
      setPageTitle(newUserInfo.nickname)
    } else {
      setPageTitle('')
    }
  },
  { immediate: true }
)

// 监听路由参数变化，重新获取用户信息
watch(
  () => route.params.id,
  (newUserId) => {
    if (newUserId) {
      currentArticlePage.value = 1
      fetchUserInfo()
      fetchUserArticles()
      initUserStats()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
/* 骨架加载器样式 */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 骨架加载器各部分尺寸 */
.skeleton-avatar {
  width: 120px;
  height: 120px;
  border-radius: 8px;
}

.skeleton-nickname {
  height: 1.5rem;
  width: 150px;
}

.skeleton-badge {
  height: 1.2rem;
  width: 80px;
  border-radius: 1rem;
}

.skeleton-website {
  height: 1rem;
  width: 200px;
}

.skeleton-info-item {
  height: 1rem;
  width: 120px;
}

.skeleton-description {
  height: 6rem;
  width: 100%;
}

.skeleton-tag {
  height: 1.5rem;
  width: 100px;
  border-radius: 1rem;
}

.skeleton-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
}

.skeleton-section-title {
  height: 1.2rem;
  width: 100px;
}

.skeleton-level-label {
  height: 1rem;
  width: 80px;
}

.skeleton-level-value {
  height: 1rem;
  width: 120px;
}

.skeleton-progress-label {
  height: 0.8rem;
  width: 100px;
}

.skeleton-progress-value {
  height: 0.8rem;
  width: 80px;
}

.skeleton-progress-bar {
  height: 10px;
  width: 100%;
  border-radius: 5px;
}

.skeleton-level-description {
  height: 2rem;
  width: 100%;
}

.skeleton-auth-label {
  height: 1rem;
  width: 80px;
}

.skeleton-auth-badge {
  height: 1.2rem;
  width: 100px;
  border-radius: 1rem;
}

.skeleton-button {
  height: 2rem;
  width: 120px;
  border-radius: 0.375rem;
}

/* 横幅区域 */
.banner-wrapper {
  position: relative;
}

.banner-bg {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.1));
}

/* 头像容器样式 */
.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 0.75rem;
  pointer-events: none;
}

.avatar-status {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #ccc;
  border: 3px solid white;
  transition: all 0.3s ease;
}

.avatar-status.online {
  background-color: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.8);
  }
}

/* 用户网站链接样式 */
.user-website {
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.user-website:hover {
  opacity: 0.8;
}

.user-website i {
  font-size: 1rem;
  flex-shrink: 0;
}

.truncate-url {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

/* 用户简介 */
.user-desc {
  line-height: 1.6;
  max-height: 3.2em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.stat-item {
  text-align: center;
}

.stat-value {
  color: var(--bs-secondary);
}

.stat-label {
  margin-top: 0.25rem;
}

/* 文章卡片 */
.article-item-card {
  transition: all 0.3s ease;
  border-radius: 0.75rem;
  cursor: pointer;
}

.article-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.article-cover-container {
  position: relative;
  height: 200px;
}

.article-cover-img {
  height: 100%;
  object-fit: cover;
}

.article-title {
  font-size: 1.1rem;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-desc {
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.8em;
}

.article-category {
  flex-shrink: 0;
}

.article-date {
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-bg {
    height: 150px;
  }
  
  .card-body.p-4 {
    padding: 1.25rem !important;
  }
  
  .avatar-wrapper {
    margin: 0 auto;
  }
  
  img[src*="avatar"] {
    width: 100px !important;
    height: 100px !important;
  }
  
  .stats-bar .row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  
  .stat-value {
    font-size: 1rem !important;
  }
  
  .stat-label {
    font-size: 0.75rem !important;
  }
  
  .article-cover-container {
    height: 160px;
  }
  
  .article-title {
    font-size: 0.95rem;
  }
  
  .article-desc {
    font-size: 0.875rem;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    min-height: 2.6em;
  }
  
  .truncate-url {
    max-width: 150px;
  }
  
  .user-desc {
    font-size: 0.875rem;
    max-height: 2.8em;
  }
  
  .article-category {
    font-size: 0.75rem;
  }
  
  .article-date {
    font-size: 0.75rem;
  }
}

@media (max-width: 576px) {
  .banner-bg {
    height: 120px;
  }
  
  .card-body.p-4 {
    padding: 1rem !important;
  }
  
  .article-cover-container {
    height: 140px;
  }
  
  .article-title {
    font-size: 0.9rem;
  }
  
  .article-desc {
    font-size: 0.825rem;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
  
  .stats-bar .row {
    gap: 0.75rem;
  }
  
  .stat-value {
    font-size: 0.9rem !important;
  }
  
  .stat-label {
    font-size: 0.7rem !important;
  }
}

/* 暗黑模式适配 */
[data-bs-theme=dark] {
  .stat-value {
    color: var(--bs-heading-color);
  }
  
  .stat-label {
    color: var(--bs-secondary-color);
  }
  
  .article-item-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .skeleton {
    background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
  }
  
  .avatar-status {
    border-color: var(--bs-body-bg) !important;
  }
}
</style>
