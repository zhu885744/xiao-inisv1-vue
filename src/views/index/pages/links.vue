<template>
  <div class="links">
    <!-- 全局加载状态 -->
    <div v-if="loading" class="d-flex justify-content-center align-items-center py-10">
      <div class="spinner-border text-info" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- 基础数据错误提示 -->
    <div v-else-if="error" class="alert alert-danger d-flex align-items-center mt-2" role="alert">
      <i class="bi bi-exclamation-circle-fill fs-3 me-2"></i>
      <p class="mb-0 flex-grow-1">{{ errorMsg }}</p>
    </div>

    <!-- 友链页面主体 -->
    <div v-else class="card shadow-sm border-0 rounded-3 mt-2">
      <!-- 页面标题 -->
      <header class="article-header mt-3 mb-2">
        <h1 class="article-title text-center fw-bold mb-3">{{ pageInfo.title || '友链页面' }}</h1>
      </header>
      
      <!-- 核心内容区 -->
      <div class="card-body pb-2">
        <!-- 友链介绍 -->
        <div class="article-content text-secondary mb-5">
          <i-markdown :model-value="pageInfo.content || '暂无友链介绍，敬请期待～'" />
        </div>

        <!-- 友链数据加载状态 -->
        <div v-if="linkLoading" class="d-flex justify-content-center py-3">
          <div class="spinner-border text-info spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        
        <!-- 友链加载错误 -->
        <div v-else-if="linkError" class="alert alert-warning d-flex align-items-center mt-2 p-2" role="alert">
          <i class="bi bi-exclamation-triangle-fill fs-4 me-2"></i>
          <p class="mb-0">{{ linkErrorMsg }}</p>
        </div>
        
        <!-- 无友链数据 -->
        <div v-else-if="linkList.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-link-45deg fs-1 mb-3"></i>
          <p class="mb-0">暂无友链数据，敬请期待～</p>
        </div>
        
        <!-- 友链分组展示 -->
        <div v-else class="link-list-container">
          <div v-for="(groupLinks, groupName) in groupLinkMap" :key="groupName" class="mb-6">
            <h3 class="link-cate mt-3">{{ groupName }}</h3>
            <!-- 调整列布局：长方形卡片适合更少的列数 -->
            <div class="row g-4">
              <!-- 响应式调整：PC端2列，平板2列，手机1列 -->
              <div v-for="link in groupLinks" :key="link.id" class="col-lg-6 col-md-6 col-sm-6 col-12">
                <!-- 长方形友链卡片：横向布局 -->
                <div class="link-card h-100 d-flex align-items-center p-4">
                  <!-- 头像区域 -->
                  <div class="link-avatar-wrapper me-4">
                    <img :src="link.avatar" :alt="link.nickname" class="link-avatar rounded-circle">
                  </div>
                  
                  <!-- 信息区域（占主要宽度） -->
                  <div class="link-info flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <h4 class="link-name fs-5 mb-0">{{ link.nickname }}</h4>
                      <a :href="link.url" :target="link.target || '_blank'" class="btn btn-outline-primary btn-sm">
                        访问
                      </a>
                    </div>
                    <p class="link-desc text-secondary mb-0">{{ link.description || '无介绍' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 底部信息 -->
      <div class="card-footer border-top d-flex justify-content-between text-muted px-4 py-2">
        <small>页面最后更新：{{ formatTime(pageInfo.last_update) }}</small>
        <small>友链共 {{ linkTotal }} 条</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import request from '@/utils/request'
import iMarkdown from '@/comps/custom/i-markdown.vue'

// 环境变量
const SITE_TITLE = import.meta.env.VITE_TITLE || '朱某的生活印记'
const PAGE_KEY = 'links'

// 页面基础状态
const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')
const pageInfo = ref({
  title: '友链',
  content: ''
})
const pageTitle = ref(`友链 - ${SITE_TITLE}`)

// 友链状态
const linkLoading = ref(false)
const linkError = ref(false)
const linkErrorMsg = ref('')
const linkList = ref([]) // 存储全部友链数据
const linkTotal = ref(0) // 友链总条数

// 友链分组聚合
const groupLinkMap = computed(() => {
  const map = {}
  linkList.value.forEach(link => {
    const groupName = link.result?.group?.name || '未分组'
    if (!map[groupName]) map[groupName] = []
    map[groupName].push(link)
  })
  return map
})

// 时间格式化
const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0 || isNaN(timestamp)) return '未知时间'
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取友链页面基础数据
const getPageData = async () => {
  loading.value = true
  try {
    const res = await request.get(`/api/pages/one?key=${PAGE_KEY}`, {
      params: {
        key: PAGE_KEY,
        cache: false,
        withTrashed: false
      }
    })
    if (res && res.code === 200 && res.data && typeof res.data === 'object' && Object.keys(res.data).length > 0) {
      pageInfo.value = { ...pageInfo.value, ...res.data }
      pageTitle.value = `${res.data.title || '友链'} - ${SITE_TITLE}`
      document.title = pageTitle.value
    } else {
      error.value = true
      errorMsg.value = '未找到友链页面配置，请联系管理员检查后台'
    }
  } catch (err) {
    error.value = true
    errorMsg.value = '网络异常，无法加载友链页面配置'
    console.error('[友链页面基础数据异常]：', err)
  } finally {
    loading.value = false
  }
}

// 获取全部友链数据
const getAllLinks = async () => {
  linkLoading.value = true
  try {
    // 直接写死API地址参数，不配置任何动态参数
    const res = await request.get('/api/links/all?page=1&limit=500&order=id+asc')
    if (res && res.code === 200 && res.data) {
      const { data = [], count = 0 } = res.data
      linkList.value = data     // 直接赋值全部数据
      linkTotal.value = count   // 总条数
    } else {
      linkError.value = true
      linkErrorMsg.value = res?.msg || '获取友链数据失败'
    }
  } catch (err) {
    linkError.value = true
    linkErrorMsg.value = '网络异常，无法加载友链数据'
    console.error('[友链数据请求异常]：', err)
  } finally {
    linkLoading.value = false
  }
}

// 页面初始化
onMounted(async () => {
  await getPageData()
  await getAllLinks()
})
</script>

<style scoped>
/* 页面标题样式 */
.article-title {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  line-height: 1.3;
  font-weight: 700;
}

/* 友链介绍Markdown样式 */
.article-content {
  line-height: 1.8;
  font-size: 1.05rem;
  padding: 0.5rem 0;
}

/* 友链分组标题 */
.link-cate {
  font-size: 1.2rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 1rem !important;
}

/* 核心：长方形友链卡片样式 */
.link-card {
  border: 1px solid #e9ecef;
  border-radius: 0.8rem;
  transition: all 0.3s ease;
  background-color: #fff;
  min-height: 120px; /* 长方形高度 */
}

/* 卡片悬浮效果 */
.link-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  border-color: #dee2e6;
  transform: translateY(-2px);
}

/* 头像样式（长方形卡片中适当放大） */
.link-avatar {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border: 3px solid #f8f9fa;
}

/* 名称样式 */
.link-name {
  font-weight: 600;
  color: #212529;
}

/* 描述样式 */
.link-desc {
  line-height: 1.5;
  font-size: 0.95rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 通用Markdown样式 */
.article-content h2 {
  font-size: 1.5rem;
  margin: 1.5rem 0 1rem;
  font-weight: 600;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.article-content a {
  color: #0d6efd;
  text-decoration: none;
}

.article-content a:hover {
  color: #0a58ca;
  text-decoration: underline;
}

.article-content p {
  margin-bottom: 1rem;
}

/* 加载状态 */
.py-10 {
  padding-top: 10rem;
  padding-bottom: 10rem;
}

/* 响应式适配 - 长方形卡片专属 */
@media (max-width: 992px) {
  .article-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  .article-content h2 {
    font-size: 1.25rem;
  }
  .link-cate {
    font-size: 1.1rem;
  }
  .link-avatar {
    width: 50px;
    height: 50px;
  }
  .link-card {
    min-height: 100px;
    padding: 1.5rem !important;
  }
}

@media (max-width: 768px) {
  .link-cate {
    font-size: 1rem;
  }
  .link-avatar {
    width: 45px;
    height: 45px;
  }
  .link-card {
    min-height: 90px;
    padding: 1.2rem !important;
  }
  .link-name {
    font-size: 1rem !important;
  }
}

@media (max-width: 576px) {
  .link-avatar {
    width: 40px;
    height: 40px;
  }
  .link-card {
    min-height: 80px;
    padding: 1rem !important;
  }
  .link-cate {
    font-size: 0.95rem;
  }
  .link-desc {
    font-size: 0.85rem;
  }
  /* 手机端单列展示 */
  .link-list-container .row > div {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>