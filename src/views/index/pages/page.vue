<template>
  <div class="page-wrapper">
    <!-- 加载状态：复用文章页样式 -->
    <div v-if="loading" class="page-loading">
      <div class="spinner-border text-info fs-4" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="article-content-wrap card border-0 shadow-sm p-3 mt-2">
      <p class="mb-0 fw-normal">{{ errorMsg }}</p>
    </div>

    <!-- 独立页面主体 -->
    <div v-else class="article-main">
      <main class="article-content-wrap card border-0 shadow-sm p-3 mt-2">
        <header class="article-header mt-2">
          <h1 class="article-title text-center fw-bold mb-3">{{ pageInfo.title }}</h1>
        </header>
        <div class="article-content mt-4">
          <i-markdown :model-value="pageInfo.content || '暂无页面内容，敬请期待～'" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '@/utils/request'
import iMarkdown from '@/comps/custom/i-markdown.vue'

// 环境变量网站标题，兜底处理
const SITE_TITLE = import.meta.env.VITE_TITLE || '朱某的生活印记'

// 接收路由传递的页面key：加default兜底，防止props.key为undefined
const props = defineProps({
  key: {
    type: String,
    required: false, // 改为非必传，由代码兜底
    default: '',     // 核心：默认值为空字符串，彻底避免undefined
  }
})

// 响应式状态
const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')
const pageInfo = ref({})
const pageTitle = ref(`加载中... - ${SITE_TITLE}`)

// 路由实例
const router = useRouter()
const route = useRoute()

// 监听页面标题更新浏览器标签
watch(
  pageTitle,
  (newTitle) => {
    document.title = newTitle
  },
  { immediate: true }
)

/**
 * 时间格式化：保留时分，适配最后更新时间
 */
const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return '未知时间'
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/**
 * Key合法性校验：全量兜底，防止key为undefined/null
 */
const checkPageKey = (key) => {
  // 入参是initPage处理过的currentKey，已做trim，直接判断即可
  if (!key) {
    errorMsg.value = '页面标识不能为空，请检查访问地址'
    return false
  }
  const keyReg = /^[a-zA-Z0-9-_]+$/
  if (!keyReg.test(key)) {
    errorMsg.value = '页面标识不合法，仅允许字母、数字、横杠和下划线'
    return false
  }
  if (key.length > 20) {
    errorMsg.value = '页面标识过长，最大支持20个字符'
    return false
  }
  return true
}

/**
 * 获取独立页面数据：入参加兜底，双重防护
 */
const getPageData = async (pageKey) => {
  loading.value = true
  error.value = false
  errorMsg.value = ''
  try {
    const queryParams = {
      key: String(pageKey || '').trim(), // 兜底空字符串
      cache: false,
      withTrashed: false
    }
    const res = await request.get('/api/pages/one', queryParams)

    if (res.code === 200) {
      if (!res.data || Object.keys(res.data).length === 0) {
        error.value = true
        errorMsg.value = '未找到该独立页面，可能已被删除或访问地址错误'
        pageTitle.value = `页面不存在 - ${SITE_TITLE}`
      } else {
        pageInfo.value = res.data
        error.value = false
        pageTitle.value = `${pageInfo.value.title} - ${SITE_TITLE}`
      }
    } else {
      error.value = true
      errorMsg.value = res.msg || '获取独立页面数据失败'
      pageTitle.value = `获取页面失败 - ${SITE_TITLE}`
    }
  } catch (err) {
    error.value = true
    errorMsg.value = '网络异常，请检查网络后刷新页面'
    console.error('[独立页面接口异常]：', err)
    pageTitle.value = `网络异常 - ${SITE_TITLE}`
  } finally {
    loading.value = false
  }
}

/**
 * 页面初始化：封装校验+请求逻辑，加兜底
 */
const initPage = () => {
  // 直接从路由取原始key，做兜底处理（最稳妥）
  const currentKey = (route.params.key || '').trim()
  if (checkPageKey(currentKey)) {
    getPageData(currentKey)
  } else {
    error.value = true
    loading.value = false
    pageTitle.value = `页面标识不合法 - ${SITE_TITLE}`
    setTimeout(() => router.go(-1), 3000)
  }
}

// 监听路由参数变化：加新参数兜底，避免undefined
watch(
  () => route.params.key,
  () => {
    initPage() // 直接执行，内部会取最新的key并校验
  },
  { immediate: false }
)

// 页面挂载初始化
onMounted(() => {
  initPage()
})
</script>

<style scoped>
/* 加载状态 */
.page-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

/* 错误状态 */
.page-error {
  min-height: 60vh;
}

/* 页面标题 */
.article-title {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  line-height: 1.3;
  font-weight: 700;
}

/* 文章内容区：复用文章页Markdown样式 */
.article-content {
  line-height: 1.8;
  font-size: 1.05rem;
}

/* Markdown适配样式（和文章页完全一致） */
.article-content :deep(p) {
  margin-bottom: 1.2rem;
  text-align: justify;
}
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4) {
  margin: 1.8rem 0 0.8rem;
  font-weight: 600;
  line-height: 1.4;
}
.article-content :deep(h2) {
  font-size: 1.5rem;
  padding-bottom: 0.5rem;
}
.article-content :deep(h3) {
  font-size: 1.25rem;
}
.article-content :deep(img) {
  max-width: 100%;
  border-radius: 0.5rem;
  margin: 1.5rem auto;
  display: block;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
.article-content :deep(pre) {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.2rem;
  overflow-x: auto;
  border: 1px solid #e5e7eb;
}
.article-content :deep(code) {
  background-color: #f3f4f6;
  padding: 0.15rem 0.3rem;
  border-radius: 0.25rem;
  font-size: 0.95em;
}
.article-content :deep(ul),
.article-content :deep(ol) {
  margin-bottom: 1.2rem;
  padding-left: 1.8rem;
}
.article-content :deep(li) {
  margin-bottom: 0.5rem;
}
.article-content :deep(a) {
  color: #2563eb;
  text-decoration: none;
}
.article-content :deep(a:hover) {
  text-decoration: underline;
  text-underline-offset: 0.2rem;
}
.article-content :deep(blockquote) {
  border-left: 4px solid #d1d5db;
  padding: 0.5rem 1rem;
  background-color: #f9fafb;
  margin-bottom: 1.2rem;
  color: #4b5563;
}
.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.2rem;
}
.article-content :deep(td),
.article-content :deep(th) {
  border: 1px solid #e5e7eb;
  padding: 0.7rem;
  text-align: left;
}
.article-content :deep(th) {
  background-color: #f9fafb;
  font-weight: 600;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .article-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  .article-content {
    font-size: 1rem;
  }
}
</style>