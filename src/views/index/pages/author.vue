<template>
  <div class="author-info-card card border rounded-2 shadow-sm mt-2">
    <!-- 作者信息卡片头部 -->
    <div class="card-header bg-transparent border-bottom-0 py-3 px-4">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0 d-flex align-items-center gap-2">
          <i class="bi bi-person-badge-fill text-primary fs-5"></i>
          作者信息展示
        </h5>
        <button 
          @click="refreshData" 
          class="btn btn-sm btn-outline-primary rounded-1 px-3 py-1"
          :disabled="loading"
        >
          <i class="bi" :class="loading ? 'bi-arrow-clockwise spin' : 'bi-arrow-clockwise'"></i>
          刷新
        </button>
      </div>
    </div>

    <div class="card-body p-4">
      <!-- 作者基本信息 -->
      <div class="author-basic-info mb-4">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="position-relative">
            <img 
              :src="author.avatar || defaultAvatar" 
              alt="作者头像"
              class="rounded-circle border border-3 border-white shadow-sm"
              width="80"
              height="80"
              style="object-fit: cover;"
              @error="handleAvatarError"
            >
            <div v-if="author.isVerified" class="position-absolute bottom-0 end-0">
              <i class="bi bi-patch-check-fill text-primary fs-5"></i>
            </div>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex align-items-center gap-2 mb-1">
              <h4 class="mb-0 fw-bold">{{ author.name }}</h4>
              <span v-if="author.level" class="badge bg-primary rounded-pill fs-7">
                Lv.{{ author.level }}
              </span>
            </div>
            <p class="text-muted mb-2">
              <i class="bi bi-briefcase me-1"></i>
              {{ author.title || '资深创作者' }}
            </p>
            <div class="d-flex align-items-center gap-3">
              <span class="d-flex align-items-center gap-1">
                <i class="bi bi-geo-alt"></i>
                {{ author.location || '未知地区' }}
              </span>
              <span class="d-flex align-items-center gap-1">
                <i class="bi bi-calendar3"></i>
                加入时间：{{ formatDate(author.joinDate) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 作者签名 -->
        <div class="author-signature mb-3 p-3 bg-light-subtle rounded-2">
          <p class="mb-0 fs-6">
            <i class="bi bi-quote text-primary me-2"></i>
            {{ author.signature || '这个人很懒，什么都没有留下...' }}
          </p>
        </div>
      </div>

      <!-- 数据统计 -->
      <div class="author-stats row g-3 mb-4">
        <div class="col-4 col-md-2 text-center">
          <div class="p-3 bg-primary-subtle rounded-2">
            <div class="fw-bold fs-4 text-primary">{{ author.stats.articles }}</div>
            <div class="text-muted fs-7">文章</div>
          </div>
        </div>
        <div class="col-4 col-md-2 text-center">
          <div class="p-3 bg-success-subtle rounded-2">
            <div class="fw-bold fs-4 text-success">{{ author.stats.likes }}</div>
            <div class="text-muted fs-7">获赞</div>
          </div>
        </div>
        <div class="col-4 col-md-2 text-center">
          <div class="p-3 bg-info-subtle rounded-2">
            <div class="fw-bold fs-4 text-info">{{ author.stats.views }}</div>
            <div class="text-muted fs-7">阅读量</div>
          </div>
        </div>
        <div class="col-4 col-md-2 text-center">
          <div class="p-3 bg-warning-subtle rounded-2">
            <div class="fw-bold fs-4 text-warning">{{ author.stats.followers }}</div>
            <div class="text-muted fs-7">粉丝</div>
          </div>
        </div>
        <div class="col-4 col-md-2 text-center">
          <div class="p-3 bg-danger-subtle rounded-2">
            <div class="fw-bold fs-4 text-danger">{{ author.stats.comments }}</div>
            <div class="text-muted fs-7">评论</div>
          </div>
        </div>
        <div class="col-4 col-md-2 text-center">
          <div class="p-3 bg-secondary-subtle rounded-2">
            <div class="fw-bold fs-4 text-secondary">{{ author.stats.shares }}</div>
            <div class="text-muted fs-7">分享</div>
          </div>
        </div>
      </div>

      <!-- 技能标签 -->
      <div class="author-skills mb-4">
        <h6 class="mb-3 d-flex align-items-center gap-2">
          <i class="bi bi-tools text-primary"></i>
          技能标签
        </h6>
        <div class="d-flex flex-wrap gap-2">
          <span 
            v-for="(skill, index) in author.skills" 
            :key="index"
            class="badge rounded-pill px-3 py-2"
            :class="getSkillBadgeClass(index)"
            @click="showSkillMessage(skill)"
          >
            {{ skill }}
          </span>
        </div>
      </div>

      <!-- 最近文章 -->
      <div class="recent-articles mb-4">
        <h6 class="mb-3 d-flex align-items-center gap-2">
          <i class="bi bi-file-text text-primary"></i>
          最近文章
        </h6>
        <div class="list-group">
          <a 
            v-for="article in author.recentArticles" 
            :key="article.id"
            href="#"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-0 py-2 px-3 mb-1 rounded-2 hover-lift"
            @click.prevent="showArticleDetail(article)"
          >
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-file-text text-muted"></i>
              <span class="text-truncate" style="max-width: 200px;">{{ article.title }}</span>
            </div>
            <div class="text-muted fs-7">
              {{ formatDate(article.date) }}
            </div>
          </a>
        </div>
      </div>

      <!-- 交互按钮 -->
      <div class="author-actions d-flex gap-2 flex-wrap">
        <button 
          @click="followAuthor" 
          class="btn btn-primary btn-sm rounded-1 px-4 py-2"
          :disabled="author.isFollowing"
        >
          <i class="bi" :class="author.isFollowing ? 'bi-check-circle' : 'bi-plus-circle'"></i>
          {{ author.isFollowing ? '已关注' : '关注作者' }}
        </button>
        <button 
          @click="sendMessage" 
          class="btn btn-outline-primary btn-sm rounded-1 px-4 py-2"
        >
          <i class="bi bi-chat-left-text"></i>
          发送消息
        </button>
        <button 
          @click="shareProfile" 
          class="btn btn-outline-secondary btn-sm rounded-1 px-4 py-2"
        >
          <i class="bi bi-share"></i>
          分享资料
        </button>
        <button 
          @click="showAllStats" 
          class="btn btn-outline-info btn-sm rounded-1 px-4 py-2"
        >
          <i class="bi bi-graph-up"></i>
          详细数据
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="card-footer text-center py-3 bg-transparent">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">加载中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import defaultAvatar from '@/assets/img/avatar.png'

// 响应式数据
const loading = ref(false)
const author = ref({
  id: 1,
  name: '张三',
  avatar: defaultAvatar,
  title: '全栈开发者',
  level: 8,
  location: '北京',
  joinDate: '2022-03-15',
  signature: '热爱编程，热爱生活，分享知识与快乐！',
  isVerified: true,
  isFollowing: false,
  stats: {
    articles: 128,
    likes: 3567,
    views: 152890,
    followers: 487,
    comments: 1256,
    shares: 324
  },
  skills: ['Vue.js', 'React', 'Node.js', 'TypeScript', 'Python', 'Docker', 'MySQL', 'Git'],
  recentArticles: [
    { id: 1, title: 'Vue 3 性能优化完全指南', date: '2024-01-15', views: 12500 },
    { id: 2, title: 'TypeScript 高级类型技巧', date: '2024-01-10', views: 8900 },
    { id: 3, title: 'Node.js 微服务架构实践', date: '2024-01-05', views: 6700 },
    { id: 4, title: '前端工程化最佳实践', date: '2024-01-01', views: 15300 }
  ]
})

// 计算属性
const activityScore = computed(() => {
  const stats = author.value.stats
  return (stats.articles * 5 + stats.likes * 3 + stats.comments * 2) / 100
})

const formattedStats = computed(() => {
  const stats = author.value.stats
  return {
    articles: stats.articles.toLocaleString(),
    likes: stats.likes.toLocaleString(),
    views: (stats.views / 1000).toFixed(1) + 'k',
    followers: stats.followers.toLocaleString(),
    comments: stats.comments.toLocaleString(),
    shares: stats.shares.toLocaleString()
  }
})

// 方法
const refreshData = async () => {
  loading.value = true
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 更新数据
    author.value.stats = {
      articles: author.value.stats.articles + Math.floor(Math.random() * 3),
      likes: author.value.stats.likes + Math.floor(Math.random() * 20),
      views: author.value.stats.views + Math.floor(Math.random() * 100),
      followers: author.value.stats.followers + Math.floor(Math.random() * 2),
      comments: author.value.stats.comments + Math.floor(Math.random() * 5),
      shares: author.value.stats.shares + Math.floor(Math.random() * 3)
    }
    
    // 显示成功消息
    showMessage('success', '数据更新成功！')
  } catch (error) {
    showMessage('error', '数据更新失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const followAuthor = () => {
  author.value.isFollowing = !author.value.isFollowing
  const message = author.value.isFollowing ? '已关注作者' : '已取消关注'
  showMessage('info', message)
}

const sendMessage = () => {
  const message = `正在准备给 ${author.value.name} 发送消息...`
  showMessage('info', message)
  
  // 模拟消息发送
  setTimeout(() => {
    showMessage('success', '消息发送成功！')
  }, 1500)
}

const shareProfile = () => {
  const shareText = `分享 ${author.value.name} 的个人资料：资深开发者，关注了解更多精彩内容！`
  if (navigator.share) {
    navigator.share({
      title: `${author.value.name} 的个人资料`,
      text: shareText,
      url: window.location.href
    })
  } else {
    // 复制到剪贴板
    navigator.clipboard.writeText(shareText)
      .then(() => showMessage('success', '个人资料已复制到剪贴板！'))
      .catch(() => showMessage('error', '复制失败'))
  }
}

const showAllStats = () => {
  const stats = author.value.stats
  const message = `
    详细数据统计：
    📝 文章：${stats.articles} 篇
    ❤️ 获赞：${stats.likes} 次
    👀 阅读：${(stats.views / 1000).toFixed(1)}k 次
    👥 粉丝：${stats.followers} 人
    💬 评论：${stats.comments} 条
    🔄 分享：${stats.shares} 次
  `
  showMessage('info', message, { duration: 5000 })
}

const showSkillMessage = (skill) => {
  showMessage('info', `技能：${skill}`, { 
    position: 'top',
    showIcon: true
  })
}

const showArticleDetail = (article) => {
  const message = `《${article.title}》\n发布日期：${formatDate(article.date)}\n阅读量：${article.views.toLocaleString()}`
  showMessage('info', message, { 
    duration: 4000,
    showClose: true 
  })
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleAvatarError = (event) => {
  event.target.src = defaultAvatar
}

const getSkillBadgeClass = (index) => {
  const classes = [
    'bg-primary-subtle text-primary',
    'bg-success-subtle text-success',
    'bg-info-subtle text-info',
    'bg-warning-subtle text-warning',
    'bg-danger-subtle text-danger',
    'bg-purple-subtle text-purple',
    'bg-teal-subtle text-teal',
    'bg-pink-subtle text-pink'
  ]
  return classes[index % classes.length]
}

// 消息提示函数（使用 Toast）
const showMessage = (type, content, options = {}) => {
  if (window.Toast) {
    const defaultOptions = {
      title: '',
      delay: options.duration || 3000
    }
    
    switch(type) {
      case 'success':
        return window.Toast.success(content, { ...defaultOptions, ...options })
      case 'error':
        return window.Toast.error(content, { ...defaultOptions, ...options })
      case 'warning':
        return window.Toast.warning(content, { ...defaultOptions, ...options })
      case 'loading':
        return window.Toast.info(content, { ...defaultOptions, ...options })
      default:
        return window.Toast.info(content, { ...defaultOptions, ...options })
    }
  } else {
    // Fallback to alert if Toast not available
    alert(content)
  }
}

// 组件挂载
onMounted(() => {
  console.log('作者信息组件已加载')
})
</script>
