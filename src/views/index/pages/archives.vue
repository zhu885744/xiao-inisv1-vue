<template>
  <!-- 全局外层容器：居中、收窄宽度、统一留白 -->
  <div class="article-page-wrapper">
    <!-- 加载状态：优化尺寸、间距，更协调 -->
    <div v-if="loading" class="page-loading">
      <div class="spinner-border text-info fs-4" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="article-content-wrap card border-0 shadow-sm p-3 mt-2">
      <p class="mb-0 fw-normal">{{ errorMsg }}</p>
    </div>

    <!-- 文章主体 -->
    <div v-else class="article-main">
      <!-- 文章内容区：核心阅读区，重写样式 -->
      <main class="article-content-wrap card border-0 shadow-sm p-3 mt-2">
        <!-- 文章头部：标题+元信息 -->
      <header class="article-header mt-2">
        <h1 class="article-title text-center fw-bold mb-3">{{ articleInfo.title }}</h1>
        <!-- 文章元信息：居中布局、弱化样式 -->
        <div class="article-meta d-flex flex-wrap justify-content-center align-items-center text-muted gap-4 fs-6">
          <span class="meta-item d-flex align-items-center">
            <i class="bi bi-person-fill me-2"></i>
            {{ articleInfo.result?.author?.nickname || '匿名' }}
          </span>
          <span class="meta-item d-flex align-items-center">
            <i class="bi bi-folder-fill me-2"></i>
            {{ articleInfo.result?.group[0]?.name || '未分类' }}
          </span>
          <span class="meta-item d-flex align-items-center">
            <i class="bi bi-calendar-fill me-2"></i>
            {{ formatTime(articleInfo.create_time) }}
          </span>
          <span class="meta-item d-flex align-items-center">
            <i class="bi bi-chat-fill me-2"></i>
            {{ articleInfo.result?.comment?.count || 0 }} 评论
          </span>
          <span class="meta-item d-flex align-items-center">
            <i class="bi bi-eye-fill me-2"></i>
            {{ articleInfo.views || 0 }} 浏览
          </span>
        </div>
      </header>
        <div class="article-content mt-4">
          <i-markdown :model-value="articleInfo.content || '暂无文章内容，敬请期待～'" />
        </div>
      </main>

      <!-- 评论组件：优化间距，自然衔接 -->
      <section class="article-comment mt-2 mb-8">
        <CommentList
          :articleId="getCurrentArticleId()"
          :commentCount="commentCount"
          :commentList="staticCommentList"
          :isLogin="isLogin"
          :isDarkMode="isDarkMode"
          :articleAuthor="articleInfo.result?.author || {}"
          @publishComment="handlePublishComment"
          @replyComment="handleReplyComment"
        />
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '@/utils/request'
import iMarkdown from '@/comps/custom/i-markdown.vue'
import CommentList from '@/comps/custom/i-comment.vue'
import { useCommStore } from '@/store/comm'
import utils from '@/utils/utils'

// 存储
const store = {
  comm: useCommStore()
};

// 环境变量网站标题，兜底处理
const SITE_TITLE = import.meta.env.VITE_TITLE || '朱某的生活印记'

// 路由参数获取文章ID
const getCurrentArticleId = () => {
  return route.params.id
}

// 响应式状态：保留所有原有业务逻辑
const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')
const articleInfo = ref({})
const pageTitle = ref(`加载中... - ${SITE_TITLE}`)
// 评论相关响应式数据
const staticCommentList = ref([])
const commentCount = ref(0)
const isDarkMode = ref(false)

// 路由实例
const router = useRouter()
const route = useRoute()

// 监听页面标题，更新浏览器标签
watch(
  pageTitle,
  (newTitle) => {
    document.title = newTitle
  },
  { immediate: true }
)

/**
 * 时间格式化：使用utils.js中的timeToDate函数
 */
const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return '未知时间'
  return utils.timeToDate(timestamp, 'Y-m-d')
}

/**
 * 文章ID合法性校验：复用原有逻辑
 */
const checkArticleId = (id) => {
  const idVal = String(id).trim()
  if (!idVal) {
    errorMsg.value = '文章ID不能为空，请检查访问地址'
    return false
  }
  const numId = Number(idVal)
  if (isNaN(numId) || numId <= 0) {
    errorMsg.value = '文章ID不合法，必须为正整数'
    return false
  }
  return true
}

/**
 * 请求文章详情：复用原有逻辑
 */
const getArticleDetail = async (id) => {
  loading.value = true
  try {
    const queryParams = { id, cache: false }
    const res = await request.get('/api/article/one', queryParams)

    if (res.code === 200) {
      if (!res.data || Object.keys(res.data).length === 0) {
          error.value = true
          errorMsg.value = '未找到该文章，可能已被删除或ID错误'
          pageTitle.value = `文章不存在 - ${SITE_TITLE}`
        } else {
          articleInfo.value = res.data
          error.value = false
          pageTitle.value = `${articleInfo.value.title} - ${SITE_TITLE}`
          // 获取文章评论
          getComments(articleInfo.value.id)
        }
    } else {
      error.value = true
      errorMsg.value = res.msg || '获取文章详情失败'
      pageTitle.value = `获取文章失败 - ${SITE_TITLE}`
    }
  } catch (err) {
    error.value = true
    errorMsg.value = '网络异常，请检查网络后刷新页面'
    console.error('[文章详情接口异常]：', err)
    pageTitle.value = `网络异常 - ${SITE_TITLE}`
  } finally {
    loading.value = false
  }
}

// 计算属性
const isLogin = computed(() => store.comm.login.finish && Object.keys(store.comm.login.user).length > 0)

// 获取文章评论
const getComments = async (articleId) => {
  try {
    const res = await request.get('/api/comment/flat', {
      bind_id: articleId,
      bind_type: 'article',
      page: 1,
      limit: 50,
      order: 'create_time desc'
    })
    
    if (res.code === 200) {
      commentCount.value = res.data?.count || 0
      staticCommentList.value = res.data?.data || []
    }
  } catch (error) {
    console.error('获取评论失败：', error)
  }
}

// 发布评论
const handlePublishComment = async (data) => {
  try {
    const res = await request.post('/api/comment/create', {
      content: data.content,
      bind_type: 'article',
      bind_id: articleInfo.value.id
    })
    
    if (res.code === 200) {
      // 重新获取评论列表
      await getComments(articleInfo.value.id)
      // 显示成功提示
      if (window.Toast) {
        window.Toast.success('评论发布成功！')
      }
    } else {
      // 显示失败提示
      if (window.Toast) {
        window.Toast.error(res.msg || '评论发布失败')
      }
    }
  } catch (error) {
    console.error('发布评论失败：', error)
    if (window.Toast) {
      window.Toast.error('网络异常，评论发布失败')
    }
  }
}

// 回复评论
const handleReplyComment = async (data) => {
  try {
    const res = await request.post('/api/comment/create', {
      content: data.content,
      bind_type: 'article',
      bind_id: articleInfo.value.id,
      pid: data.commentId
    })
    
    if (res.code === 200) {
      // 重新获取评论列表
      await getComments(articleInfo.value.id)
      // 显示成功提示
      if (window.Toast) {
        window.Toast.success('回复发布成功！')
      }
    } else {
      // 显示失败提示
      if (window.Toast) {
        window.Toast.error(res.msg || '回复发布失败')
      }
    }
  } catch (error) {
    console.error('回复评论失败：', error)
    if (window.Toast) {
      window.Toast.error('网络异常，回复发布失败')
    }
  }
}



// 检测深色模式
const detectDarkMode = () => {
  isDarkMode.value = document.documentElement.classList.contains('dark') || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
}

// 页面挂载执行核心逻辑
onMounted(() => {
  const currentId = getCurrentArticleId()
  if (checkArticleId(currentId)) {
    getArticleDetail(Number(currentId))
  } else {
    error.value = true
    loading.value = false
    pageTitle.value = `文章ID不合法 - ${SITE_TITLE}`
    setTimeout(() => router.go(-1), 3000)
  }
  
  detectDarkMode()
  
  // 监听深色模式变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectDarkMode)
})

// 监听路由参数变化，重新获取文章数据
watch(
  () => route.params.id,
  (newId) => {
    if (newId && checkArticleId(newId)) {
      getArticleDetail(Number(newId))
    }
  },
  { immediate: false }
)
</script>

<style scoped>
/* 加载状态：居中、占满视口高度 */
.page-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

/* 文章标题：响应式字号、优化行高、居中 */
.article-title {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  line-height: 1.3;
  font-weight: 700;
}

/* 文章元信息：弱化样式、统一图标 */
.article-meta {
  font-size: 0.9rem;
  color: #6b7280;
  flex-wrap: wrap;
}
.article-meta .meta-item {
  white-space: nowrap;
}
.article-meta .bi {
  font-size: 1em;
  color: #9ca3af;
}

/* 文章内容区：核心阅读样式优化 */
.article-content {
  line-height: 1.8;
  font-size: 1.05rem;
}

/* 适配Markdown渲染的内部样式（核心：保证阅读体验） */
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

/* 评论区容器：基础间距 */
.article-comment {
  width: 100%;
}
/* 关键：768px及以下屏幕 文章元信息适配缩小 */
@media (max-width: 768px) {
  .article-meta {
    font-size: 0.65rem; /* 字号缩小，核心 */
    gap: 0.6rem !important; /* 元信息项之间的间距缩小，!important覆盖bootstrap的gap-4 */
  }
  .article-meta .meta-item .bi {
    font-size: 0.8em; /* 图标字号轻微缩小，更协调 */
    margin-right: 0.3rem !important; /* 图标与文字间距缩小 */
  }
}
</style>