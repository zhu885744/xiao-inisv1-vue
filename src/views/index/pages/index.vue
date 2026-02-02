<template>
  <!-- 公告卡片 - 单独抽离，样式微调 -->
  <div class="card article-announce-card mt-2 shadow-sm">
    <div class="card-body d-flex align-items-center">
      <span class="badge text-bg-danger me-2"><i class="bi bi-megaphone"></i></span>
      <span class="fw-medium">新系统启用公告<a href="https://blog.zhuxu.asia/archives/182/" class="text-decoration-none">[点击查看]</a></span>
      <span class="ms-auto text-muted small">2026-2-2</span>
    </div>
  </div>
  <div class="card article-announce-card mt-2 shadow-sm">
    <div class="card-body d-flex align-items-center">
      <span class="badge text-bg-danger me-2"><i class="bi bi-megaphone"></i></span>
      <span class="fw-medium">本站正在快马加鞭赶制中，预计在3月初正式上线！</span>
      <span class="ms-auto text-muted small">2026-2-2</span>
    </div>
  </div>

  <!-- 加载状态 -->
  <div v-if="loading && articleList.length === 0" class="d-flex justify-content-center align-items-center py-5">
    <div class="spinner-border text-info" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <!-- 空数据状态 -->
  <div v-else-if="articleList.length === 0 && !loading" class="alert alert-light text-center py-5 mt-2">
    <i class="bi bi-file-earmark-text fs-3 mb-2"></i>
    <p class="mb-0 text-muted">暂无文章数据</p>
  </div>

  <!-- 文章列表 - Grid网格容器：一行3列，自适应响应式，统一间距 -->
  <div v-else class="article-list-container mt-3 grid-article-list">
    <!-- 遍历文章数据，key绑定唯一标识 -->
    <div 
      class="card article-item-card shadow-sm hover-shadow"
      v-for="article in articleList" 
      :key="article.id"
    >
      <div class="card-body p-0 d-flex flex-column h-100">
        <!-- 文章封面图 - 小卡片专用，固定比例防止变形 -->
        <div class="article-cover flex-shrink-0">
          <img 
            :src="article.covers || `https://picsum.photos/400/300?random=${article.id}`" 
            :alt="article.title" 
            class="article-cover-img w-100 h-100 object-cover"
          >
        </div>
        <!-- 文章内容区 - 自适应高度，填充剩余空间 -->
        <div class="article-content p-3 flex-grow-1 d-flex flex-column">
          <!-- 文章标题 - 小卡片适配，字号缩小+1行省略 -->
          <h3 class="article-title fw-bold mb-2 m-0">{{ article.title }}</h3>

          <!-- 文章摘要 - 小卡片适配，1行省略，更紧凑 -->
          <p class="article-desc lh-base text-truncate-1 mt-auto mb-0">
            {{ article.abstract || '暂无摘要' }}
          </p>

          <!-- 文章元信息 - 小卡片适配，字号缩小+间距精简 -->
          <div class="card-text d-flex flex-wrap gap-2 align-items-center my-2">
            <span class="meta-item">{{ article.result?.author?.nickname || '匿名' }}</span>
            <span class="meta-item">{{ article.result?.group[0]?.name || '未分类' }}</span>
            <span class="meta-item">{{ formatTime(article.create_time) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 加载更多按钮区域 -->
  <div class="d-flex justify-content-center mt-4 mb-5">
    <!-- 加载中状态 -->
    <button 
      v-if="loading && articleList.length > 0" 
      class="btn btn-info disabled"
      disabled
    >
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      加载中...
    </button>
    <!-- 加载更多按钮（还有更多数据时显示） -->
    <button 
      v-else-if="hasMore" 
      class="btn btn-primary"
      @click="loadMore"
    >
      加载更多
    </button>
    <!-- 没有更多数据时显示 -->
    <button 
      v-else 
      class="btn btn-outline-secondary disabled"
      disabled
    >
      已加载全部数据
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// 引入封装好的request工具（注意路径和导出方式匹配）
import request from '@/utils/request' 

// 响应式数据
const articleList = ref([])    // 文章列表
const loading = ref(false)     // 加载状态
const currentPage = ref(1)     // 当前页码（内部使用，用户不可见）
const limit = ref(6)           // 每页/每次加载条数
const total = ref(0)           // 总条数
const order = ref('create_time desc') // 排序方式

// 是否还有更多数据可加载
const hasMore = computed(() => {
  return articleList.value.length < total.value
})

/**
 * 时间戳格式化
 * @param {number} timestamp - 时间戳（秒）
 * @returns {string} 格式化后的时间字符串
 */
const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return '未知时间'
  // 转换为毫秒（接口返回的是秒级时间戳）
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * 获取文章列表（内部通用方法）
 * @param {number} page - 页码
 * @param {boolean} isLoadMore - 是否为加载更多（true=拼接数据，false=重置数据）
 */
const getArticleList = async (page = 1, isLoadMore = false) => {
  loading.value = true
  try {
    // 构造请求参数
    const params = {
      page,
      limit: limit.value,
      order: order.value
    }

    // 请求文章列表接口
    const res = await request.get('/api/article/all', params)

    if (res.code === 200) {
      const newData = res.data.data || []
      const totalCount = res.data.count || 0
      
      // 加载更多：拼接数据；首次加载：重置数据
      if (isLoadMore) {
        articleList.value = [...articleList.value, ...newData]
      } else {
        articleList.value = newData
      }
      
      total.value = totalCount
      currentPage.value = page
    } else {
      console.error('获取文章列表失败：', res.msg)
      // 加载更多时不清空已有数据，仅首次加载时清空
      if (!isLoadMore) {
        articleList.value = []
      }
    }
  } catch (error) {
    console.error('获取文章列表接口异常：', error)
    // 加载更多时不清空已有数据，仅首次加载时清空
    if (!isLoadMore) {
      articleList.value = []
    }
  } finally {
    loading.value = false
  }
}

/**
 * 加载更多数据
 */
const loadMore = () => {
  // 边界判断：没有更多数据或正在加载时，不执行
  if (!hasMore.value || loading.value) return
  // 加载下一页数据，并拼接
  getArticleList(currentPage.value + 1, true)
}

// 页面挂载时加载第一页数据
onMounted(() => {
  getArticleList(1, false)
})
</script>

<style scoped>
/* 公告卡片样式 - 保留 */
.article-announce-card {
  border-left: 4px solid #0dcaf0;
}

/* 核心：Grid文章列表容器 - 一行3列，多断点自适应 */
.grid-article-list {
  display: grid;
  /* 核心属性：一行3列，列宽自适应，间距1rem */
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: 1rem; /* 卡片之间的间距（水平+垂直），比mb-3更统一 */
}

/* 文章卡片 - 小尺寸适配+高度统一+hover动效优化 */
.article-item-card {
  height: 100%; /* 关键：让Grid中卡片高度统一，避免错落 */
  border: 1px solid #f1f3f5; /* 轻边框，小卡片更精致 */
  transition: all 0.3s ease; /* 统一过渡动效 */
}
.hover-shadow:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08) !important;
  transform: translateY(-3px);
  border-color: transparent; /* hover时隐藏边框，阴影更自然 */
}

/* 小卡片封面 - 固定比例(3:2)，所有卡片图片尺寸统一，不拉伸 */
.article-cover {
  width: 100%;
  padding-top: 66.67%; /* 3:2比例（高度=宽度*66.67%），比固定高度更适配小卡片 */
  position: relative;
}
.article-cover-img {
  position: absolute;
  top: 0;
  left: 0;
  border-top-left-radius: calc(0.375rem - 1px);
  border-top-right-radius: calc(0.375rem - 1px);
}

/* 文章标题 - 小卡片适配：字号缩小+1行省略+行高优化 */
.article-title {
  font-size: clamp(0.95rem, 1vw, 1.1rem); /* 小屏稍大，大屏稍小 */
  line-height: 1.5;
  /* 1行溢出省略 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 文章元信息 - 小卡片适配：字号缩小+竖线精简+间距优化 */
.article-meta {
  font-size: 0.8rem;
  margin-bottom: 0.5rem !important;
}
.article-meta .meta-item {
  position: relative;
  padding-left: 0.5rem; /* 竖线和文字间距缩小，更紧凑 */
}
.article-meta .meta-item:not(:first-child)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 0.75rem; /* 竖线高度缩短，适配小字号 */
  background-color: currentColor;
  opacity: 0.6; /* 竖线更浅，不突兀 */
}

/* 摘要1行溢出省略 - 小卡片专用 */
.text-truncate-1 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #6c757d;
  font-size: 0.85rem;
  line-height: 1.6;
}

/* 内容区 - 小卡片适配：弹性布局，摘要靠下，内容更整齐 */
.article-content {
  height: 100%;
}

/* 加载更多按钮样式优化 */
.btn-outline-info {
  --bs-btn-color: #0dcaf0;
  --bs-btn-border-color: #0dcaf0;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #0dcaf0;
  --bs-btn-hover-border-color: #0dcaf0;
}
</style>