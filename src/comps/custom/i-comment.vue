<!-- src/comps/CommentList.vue 通用评论组件 -->
<template>
  <div class="card shadow-sm bg-body-tertiary">
    <!-- 评论区标题：接收props的评论数，动态展示 -->
    <div class="card-header bg-transparent">
      <h3 class="h5 fw-bold mt-2">
        <i class="bi bi-chat-dots me-2"></i>
        评论 ({{ commentCount || 0 }})
      </h3>
    </div>
    <div class="card-body">
      <!-- 评论功能关闭提示 -->
      <div v-if="!isCommentEnabled" class="text-center py-5 text-muted">
        <i class="bi bi-chat-x fs-3 mb-2"></i>
        <p class="text-sm text-muted mt-2">感谢您的关注，评论功能正在维护中</p>
      </div>
      
      <!-- 评论输入框：仅登录状态显示 -->
      <div class="mb-5" v-if="isCommentEnabled && isLogin">
        <textarea 
          v-model="commentInput"
          class="form-control border border-secondary-subtle bg-body" 
          rows="3" 
          placeholder="请输入你的评论..."
          :class="{ 'bg-dark border-dark-subtle': isDarkMode }"
          :maxlength="maxCommentLength"
        ></textarea>
        
        <!-- 表情选择面板 -->
        <div v-if="showEmojiPicker" class="emoji-picker-panel mt-2 border rounded-3 bg-body shadow-sm" :class="{ 'bg-dark border-secondary': isDarkMode }">
          <!-- 表情分类导航 -->
          <ul class="nav nav-pills px-2 pt-2 pb-1" role="tablist">
            <li class="nav-item" v-for="(emojis, category) in owoEmojis" :key="category">
              <button 
                class="nav-link rounded-3 px-3 py-1 mb-1"
                :class="activeEmojiCategory === category ? 'active bg-primary text-white' : 'text-secondary'"
                @click="activeEmojiCategory = category"
                type="button"
                role="tab"
              >
                {{ category }}
              </button>
            </li>
          </ul>
          <!-- 表情网格 -->
          <div class="emoji-grid px-2 pb-2">
            <button 
              v-for="(emoji, index) in owoEmojis[activeEmojiCategory].container" 
              :key="index"
              @click="insertEmoji(emoji.icon)"
              class="emoji-btn rounded-2"
              :title="emoji.text"
              type="button"
            >
              {{ emoji.icon }}
            </button>
          </div>
        </div>
        
        <!-- 按钮区域：表情按钮和发布评论按钮在同一行 -->
        <div class="d-flex gap-2 mt-3">
          <button 
            @click="toggleEmojiPicker"
            class="btn btn-outline-secondary btn-sm px-4 emoji-button"
            :class="{ 'bg-dark border-dark-subtle': isDarkMode }"
          >
            <i class="bi bi-emoji-smile me-1"></i> 表情
          </button>
          <button 
              @click="handlePublish"
              class="btn btn-primary px-4 publish-btn flex-grow-1"
              :disabled="!commentInput.trim() || isCommenting"
            >
              <i class="bi" :class="isCommenting ? 'bi-arrow-clockwise spin' : 'bi-paper-plane-fill'"></i>
              {{ isCommenting ? ' 发布中...' : ' 发布评论' }}
            </button>
        </div>
      </div>

      <!-- 未登录引导区 -->
      <div class="mb-5 p-4 bg-body text-center border" v-else-if="isCommentEnabled && !isLogin">
        <i class="bi bi-person-circle fs-3 mb-2"></i>
        <p class="mb-3 text-muted">登录后即可发表评论～</p>
        <div class="d-flex gap-2 justify-content-center">
          <button 
            @click="handleToLogin()"
            class="btn btn-primary btn-sm px-4"
          >
            登录
          </button>
          <button 
            @click="handleToRegister()"
            class="btn btn-outline-primary btn-sm px-4"
          >
            注册
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="text-muted mt-2">加载评论中...</p>
      </div>

      <!-- 评论列表 -->
      <div class="comments-list" v-else-if="isCommentEnabled && processedCommentList.length > 0">
        <div 
          class="comment-item pb-4 mb-4 border-bottom border-secondary-subtle"
          v-for="(item, index) in processedCommentList" 
          :key="item.id || index"
        >
          <div class="d-flex align-items-start mb-3">
            <img 
              :src="item.avatar || fallbackAvatar" 
              class="avatar rounded-circle me-3 border border-light shadow-sm" 
              :alt="item.nickname || '用户头像'"
              style="width: 50px; height: 50px; object-fit: cover;"
            >
            <div class="flex-grow-1">
              <h6 class="fw-semibold mb-1">
                <router-link v-if="item.authorId" :to="`/author/${item.authorId}`" class="text-decoration-none ">
                  {{ item.nickname || '匿名用户' }}
                </router-link>
                <span v-else>{{ item.nickname || '匿名用户' }}</span>
                <span v-if="item.level" class="badge bg-secondary text-white ms-2 rounded-pill">Lv.{{ item.level }} {{ item.levelName }}</span>
                <span v-if="item.isAuthor" class="badge bg-primary text-white ms-2 rounded-pill">作者</span>
              </h6>
              <small class="text-muted">{{ item.time || '未知时间' }}</small>
            </div>
          </div>
          <p class="mb-3 px-2 py-1 bg-body-tertiary" v-html="item.content"></p>
          
          <!-- 回复和点赞按钮组 -->
          <div class="d-flex gap-2">
            <button 
              class="btn btn-sm btn-outline-primary" 
              @click="toggleReplyForm(index)"
              v-if="isLogin"
            >
              <i class="bi bi-reply-fill me-1"></i> 回复
            </button>
            <button 
              class="btn btn-sm btn-outline-secondary disabled" 
              v-else
              data-bs-toggle="tooltip"
              data-bs-title="登录后可回复"
            >
              <i class="bi bi-reply-fill me-1"></i> 回复
            </button>
            <!-- 点赞/点踩按钮 -->
            <button 
              class="btn btn-sm" 
              :class="getLikeStatus(item.id) ? 'btn-outline-danger' : 'btn-outline-success'"
              @click="handleCommentLike(item.id)"
              v-if="isLogin"
            >
              <i :class="getLikeStatus(item.id) ? 'bi bi-hand-thumbs-down' : 'bi bi-hand-thumbs-up'"></i>
              <span class="ms-1">{{ getLikeStatus(item.id) ? '点踩' : '点赞' }}</span>
              <span class="ms-1">{{ getLikeCount(item.id) }}</span>
            </button>
            <button 
              class="btn btn-sm btn-outline-secondary disabled" 
              v-else
              data-bs-toggle="tooltip"
              data-bs-title="登录后可点赞"
            >
              <i class="bi bi-hand-thumbs-up"></i>
              <span class="ms-1">点赞</span>
              <span class="ms-1">{{ getLikeCount(item.id) }}</span>
            </button>
          </div>

          <!-- 回复输入框 -->
          <div v-if="showReplyIndex === index || (typeof showReplyIndex === 'string' && showReplyIndex.startsWith(`${index}-`))" class="mt-3 reply-form">
            <textarea 
              v-model="replyInput"
              class="form-control border border-secondary-subtle bg-body" 
              rows="2" 
              placeholder="请输入你的回复..."
              :class="{ 'bg-dark border-dark-subtle': isDarkMode }"
              :maxlength="maxCommentLength"
            ></textarea>
            
            <!-- 回复表情选择面板 -->
            <div v-if="showReplyEmojiPicker" class="emoji-picker-panel mt-2 mb-3 border rounded-3 bg-body shadow-sm" :class="{ 'bg-dark border-secondary': isDarkMode }">
              <!-- 表情分类导航 -->
              <ul class="nav nav-pills px-2 pt-2 pb-1" role="tablist">
                <li class="nav-item" v-for="(emojis, category) in owoEmojis" :key="category">
                  <button 
                    class="nav-link rounded-3 px-3 py-1 mb-1"
                    :class="activeEmojiCategory === category ? 'active bg-primary text-white' : 'text-secondary'"
                    @click="activeEmojiCategory = category"
                    type="button"
                    role="tab"
                  >
                    {{ category }}
                  </button>
                </li>
              </ul>
              <!-- 表情网格 -->
              <div class="emoji-grid px-2 pb-2">
                <button 
                  v-for="(emoji, index) in owoEmojis[activeEmojiCategory].container" 
                  :key="index"
                  @click="insertReplyEmoji(emoji.icon)"
                  class="emoji-btn rounded-2"
                  :title="emoji.text"
                  type="button"
                >
                  {{ emoji.icon }}
                </button>
              </div>
            </div>
            
            <!-- 按钮区域 -->
            <div class="d-flex gap-2 mt-2">
              <button 
                @click="toggleReplyEmojiPicker"
                class="btn btn-sm btn-outline-secondary px-3 emoji-button"
                :class="{ 'bg-dark border-dark-subtle': isDarkMode }"
              >
                <i class="bi bi-emoji-smile me-1"></i> 表情
              </button>
              <button 
                @click="handleSubmitReply()"
                class="btn btn-sm btn-primary px-3 flex-grow-1"
                :disabled="!replyInput.trim() || isCommenting"
              >
                <i class="bi" :class="isCommenting ? 'bi-arrow-clockwise spin' : ''"></i>
                {{ isCommenting ? ' 发送中...' : ' 发送回复' }}
              </button>
              <button 
                @click="cancelReply"
                class="btn btn-sm btn-outline-secondary px-3"
              >
                取消
              </button>
            </div>
          </div>

          <!-- 评论回复：嵌套展示 -->
          <div 
            class="ms-5 mt-3 pt-3 border-top border-secondary-subtle reply-item"
            v-for="(reply, rIndex) in item.replies" 
            :key="reply.id || rIndex"
          >
            <div class="d-flex align-items-start mb-3">
              <img 
                :src="reply.avatar || fallbackAvatar" 
                class="avatar rounded-circle me-3 border border-light shadow-sm" 
                :alt="reply.nickname || '用户头像'"
                style="width: 45px; height: 45px; object-fit: cover;"
              >
              <div class="flex-grow-1">
                <h6 class="fw-semibold mb-1">
                  <router-link v-if="reply.authorId" :to="`/author/${reply.authorId}`" class="text-decoration-none ">
                    {{ reply.nickname || '匿名用户' }}
                  </router-link>
                  <span v-else>{{ reply.nickname || '匿名用户' }}</span>
                  <span v-if="reply.level" class="badge bg-secondary text-white ms-2 rounded-pill">Lv.{{ reply.level }} {{ reply.levelName }}</span>
                  <span v-if="reply.isAuthor" class="badge bg-primary text-white ms-2 rounded-pill">作者</span>
                </h6>
                <small class="text-muted">{{ reply.time || '未知时间' }}</small>
              </div>
            </div>
            <p class="mb-3 px-2 py-1 bg-body-tertiary" v-html="reply.content"></p>
            
            <!-- 回复和点赞按钮组 -->
            <div class="d-flex gap-2">
              <button 
                class="btn btn-sm btn-outline-primary" 
                @click="toggleReplyForm(index, rIndex)"
                v-if="isLogin"
              >
                <i class="bi bi-reply-fill me-1"></i> 回复
              </button>
              <button 
                class="btn btn-sm btn-outline-secondary disabled" 
                v-else
                data-bs-toggle="tooltip"
                data-bs-title="登录后可回复"
              >
                <i class="bi bi-reply-fill me-1"></i> 回复
              </button>
              <!-- 点赞/点踩按钮 -->
              <button 
                class="btn btn-sm" 
                :class="getLikeStatus(reply.id) ? 'btn-outline-danger' : 'btn-outline-success'"
                @click="handleCommentLike(reply.id)"
                v-if="isLogin"
              >
                <i :class="getLikeStatus(reply.id) ? 'bi bi-hand-thumbs-down' : 'bi bi-hand-thumbs-up'"></i>
                <span class="ms-1">{{ getLikeStatus(reply.id) ? '点踩' : '点赞' }}</span>
                <span class="ms-1">{{ getLikeCount(reply.id) }}</span>
              </button>
              <button 
                class="btn btn-sm btn-outline-secondary disabled" 
                v-else
                data-bs-toggle="tooltip"
                data-bs-title="登录后可点赞"
              >
                <i class="bi bi-hand-thumbs-up"></i>
                <span class="ms-1">点赞</span>
                <span class="ms-1">{{ getLikeCount(reply.id) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 无评论提示 -->
      <div v-else-if="isCommentEnabled && !isLoading" class="text-center py-5 text-muted">
        <p class="mb-0 h6">暂无评论，快来抢沙发吧～</p>
      </div>

      <!-- 分页控件 -->
      <div v-if="isCommentEnabled && totalComments > pageSize" class="mt-4">
        <nav aria-label="评论分页">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="handlePageChange(currentPage - 1)" :disabled="currentPage === 1">
                <span aria-hidden="true">&laquo;</span>
              </button>
            </li>
            <li v-for="page in displayedPages" :key="page" class="page-item" :class="{ active: currentPage === page, 'd-none': page === '...' }">
              <button class="page-link" @click="handlePageChange(page)" v-if="page !== '...'">
                {{ page }}
              </button>
              <span class="page-link text-muted" v-else>...</span>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="handlePageChange(currentPage + 1)" :disabled="currentPage === totalPages">
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
import { ref, onMounted, onUnmounted, watch, computed, shallowRef } from 'vue'
import { useCommStore } from '@/store/comm'
import utils from '@/utils/utils'
import request from '@/utils/request'
import Toast from '@/utils/toast'
import OwOData from '@/assets/json/OwO.json'

/**
 * @typedef {Object} CommentItem
 * @property {string|number} id - 评论ID
 * @property {string|number} authorId - 作者ID
 * @property {string} avatar - 头像地址
 * @property {string} nickname - 昵称
 * @property {number|null} level - 等级
 * @property {string} levelName - 等级名称
 * @property {string} time - 时间
 * @property {string} content - 内容（HTML）
 * @property {boolean} isAuthor - 是否为作者
 * @property {CommentItem[]} replies - 回复列表
 */

/**
 * @typedef {Object} ArticleAuthor
 * @property {string|number} id - 作者ID
 */

/**
 * @typedef {Object} Props
 * @property {string|number} articleId - 文章ID（必填）
 * @property {string|number} commentCount - 评论总数
 * @property {Array} commentList - 评论列表数据
 * @property {boolean} isLogin - 是否已登录（必填）
 * @property {ArticleAuthor} articleAuthor - 文章作者信息
 * @property {boolean} isDarkMode - 是否深色模式
 * @property {number} currentPage - 当前页码
 * @property {number} pageSize - 每页条数
 * @property {number} totalComments - 总评论数
 */

/** @type {Props} */
const props = defineProps({
  articleId: {
    type: [String, Number],
    required: true,
    validator: (val) => String(val).trim() !== ''
  },
  commentCount: {
    type: [String, Number],
    default: 0
  },
  commentList: {
    type: Array,
    default: () => []
  },
  isLogin: {
    type: Boolean,
    required: true,
    default: false
  },
  articleAuthor: {
    type: Object,
    default: () => ({})
  },
  isDarkMode: {
    type: Boolean,
    default: false
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  totalComments: {
    type: Number,
    default: 0
  }
})

/** @typedef {'publishComment' | 'replyComment' | 'toLogin' | 'toRegister' | 'pageChange'} Emits */
const emit = defineEmits(['publishComment', 'replyComment', 'toLogin', 'toRegister', 'pageChange'])

const store = useCommStore()

// 响应式状态
const commentInput = ref('')
const replyInput = ref('')
const showReplyIndex = ref(null)
const replyTarget = ref(null)
const showEmojiPicker = ref(false)
const showReplyEmojiPicker = ref(false)
const isSystemDark = ref(false)
const isLoading = ref(false)

// 点赞状态（使用shallowRef优化性能）
const commentLikes = shallowRef(new Map())
const commentLikeCounts = shallowRef(new Map())

// 评论配置
const commentConfig = ref({})
const isCommentEnabled = ref(true)
const lastCommentTime = ref(0)
const isCommenting = ref(false)
const maxCommentLength = ref(500)

// 表情数据
const owoEmojis = ref(OwOData)
const activeEmojiCategory = ref('颜文字')

// 常量
const fallbackAvatar = 'https://picsum.photos/60/60'

// 分页相关计算属性
const totalPages = computed(() => {
  return Math.ceil(props.totalComments / props.pageSize)
})

const currentPage = computed(() => props.currentPage)
const pageSize = computed(() => props.pageSize)
const totalComments = computed(() => props.totalComments)

// 优化分页显示（最多显示7个页码）
const displayedPages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  return pages
})

// 获取点赞数
const getLikeCount = (commentId) => {
  return commentLikeCounts.value.get(commentId) || 0
}

// 获取点赞状态
const getLikeStatus = (commentId) => {
  return commentLikes.value.get(commentId) || false
}

// 获取评论配置
const getCommentConfig = async () => {
  try {
    const response = await request.get('/api/config/one', { key: 'COMMENT' })
    if (response.code === 200 && response.data) {
      return response.data.json || {}
    }
    return {}
  } catch (error) {
    console.error('获取评论配置失败:', error)
    return {}
  }
}

// 验证评论内容
const validateCommentContent = (content) => {
  const config = commentConfig.value
  const length = content.length
  
  if (length > maxCommentLength.value) {
    Toast.error(`评论长度不能超过 ${maxCommentLength.value} 字`)
    return false
  }
  
  if (config.require_chinese === 1 && !/[\u4e00-\u9fa5]/.test(content)) {
    Toast.error('评论内容必须包含中文')
    return false
  }
  
  if (config.sensitive_filter === 1 && config.sensitive_words) {
    for (const word of config.sensitive_words) {
      if (content.includes(word)) {
        Toast.error('评论内容包含敏感词，请修改后重试')
        return false
      }
    }
  }
  
  return true
}

// 检查速率限制
const checkRateLimit = () => {
  const rateLimit = commentConfig.value.rate_limit || {}
  if (rateLimit.enabled !== 1) return true
  
  const maxCount = rateLimit.max_count || 5
  const timeWindow = rateLimit.time_window || 60
  const now = Date.now() / 1000
  const timeSinceLastComment = now - lastCommentTime.value
  
  if (timeSinceLastComment < timeWindow) {
    Toast.error(`评论过于频繁，请等待 ${Math.ceil(timeWindow - timeSinceLastComment)} 秒后再试`)
    return false
  }
  return true
}

// 保存评论时间
const saveCommentTime = () => {
  const currentTime = Date.now() / 1000
  lastCommentTime.value = currentTime
  try {
    localStorage.setItem('lastCommentTime', currentTime.toString())
  } catch (error) {
    console.error('存储评论时间失败:', error)
  }
}

// 处理@提及和换行
const processContent = (content, enableMention = false) => {
  if (!content) return ''
  let processed = content.replace(/\n/g, '<br>')
  if (enableMention) {
    processed = processed.replace(/@([\u4e00-\u9fa5\w]+)/g, '<span class="at-mention">@$1</span>')
  }
  return processed
}

// 获取等级名称
const getLevelName = (item) => {
  const paths = [
    item.result?.author?.result?.level?.current?.name,
    item.result?.author?.level?.current?.name,
    item.author?.result?.level?.current?.name,
    item.level?.current?.name,
    item.result?.author?.result?.levelName,
    item.result?.author?.levelName,
    item.author?.levelName,
    item.levelName
  ]
  return paths.find(Boolean) || ''
}

// 获取等级值
const getLevelValue = (item) => {
  const paths = [
    item.result?.author?.result?.level?.current?.value,
    item.result?.author?.level?.current?.value,
    item.author?.result?.level?.current?.value,
    item.level?.current?.value,
    item.level
  ]
  const value = paths.find(v => v !== undefined && v !== null)
  return value !== undefined ? value : null
}

// 获取作者ID
const getAuthorId = (item) => {
  return item.result?.author?.id || item.author?.id || null
}

// 判断是否为文章作者
const isArticleAuthor = (commentAuthorId) => {
  const articleAuthorId = props.articleAuthor.id
  return commentAuthorId && articleAuthorId && String(commentAuthorId) === String(articleAuthorId)
}

// 处理评论数据
const processedCommentList = computed(() => {
  const formatTime = (timestamp) => {
    if (!timestamp || timestamp === 0) return '未知时间'
    return utils.timeToDate(timestamp, 'Y-m-d H:i')
  }

  const processReply = (reply) => {
    const authorId = getAuthorId(reply)
    return {
      id: reply.id,
      authorId,
      avatar: reply.result?.author?.avatar?.trim() || reply.author?.avatar?.trim() || reply.avatar || fallbackAvatar,
      nickname: reply.result?.author?.nickname || reply.author?.nickname || reply.nickname || '匿名用户',
      level: getLevelValue(reply),
      levelName: getLevelName(reply),
      time: formatTime(reply.create_time || reply.time || reply.update_time),
      content: processContent(reply.content || '', true),
      isAuthor: isArticleAuthor(authorId) || reply.result?.author?.result?.isAuthor || reply.result?.author?.isAuthor || reply.author?.result?.isAuthor || reply.isAuthor || false
    }
  }

  return props.commentList.map(item => {
    const authorId = getAuthorId(item)
    return {
      id: item.id,
      authorId,
      avatar: item.result?.author?.avatar?.trim() || item.author?.avatar?.trim() || item.avatar || fallbackAvatar,
      nickname: item.result?.author?.nickname || item.author?.nickname || item.nickname || '匿名用户',
      level: getLevelValue(item),
      levelName: getLevelName(item),
      time: formatTime(item.create_time || item.time || item.update_time),
      content: processContent(item.content || ''),
      isAuthor: isArticleAuthor(authorId) || item.result?.author?.result?.isAuthor || item.result?.author?.isAuthor || item.author?.result?.isAuthor || item.isAuthor || false,
      replies: Array.isArray(item.replies) ? item.replies.map(processReply) : []
    }
  })
})

// 发布评论
const handlePublish = async () => {
  const content = commentInput.value.trim()
  if (!content) return
  if (!checkRateLimit()) return
  if (!validateCommentContent(content)) return
  
  isCommenting.value = true
  
  try {
    saveCommentTime()
    
    emit('publishComment', {
      articleId: props.articleId,
      content
    })
    
    commentInput.value = ''
  } catch (error) {
    console.error('发布评论失败:', error)
    Toast.error('发布评论失败，请稍后重试')
  } finally {
    isCommenting.value = false
  }
}

// 切换回复输入框
const toggleReplyForm = (index, replyIndex = null) => {
  const uniqueKey = replyIndex !== null ? `${index}-${replyIndex}` : index
  
  if (showReplyIndex.value === uniqueKey) {
    cancelReply()
  } else {
    showReplyIndex.value = uniqueKey
    const parentComment = processedCommentList.value[index]
    const targetComment = replyIndex !== null ? parentComment.replies[replyIndex] : parentComment
    
    replyTarget.value = targetComment
    replyInput.value = `@${targetComment.nickname} `
    
    setTimeout(() => {
      const textarea = document.querySelector('textarea[placeholder="请输入你的回复..."]')
      if (textarea) {
        textarea.focus()
        textarea.setSelectionRange(replyInput.value.length, replyInput.value.length)
      }
    }, 100)
  }
}

// 提交回复
const handleSubmitReply = async () => {
  const content = replyInput.value.trim()
  if (!content) return
  if (!checkRateLimit()) return
  if (!validateCommentContent(content)) return
  
  const commentId = replyTarget.value?.id
  if (!commentId) return
  
  isCommenting.value = true
  
  try {
    saveCommentTime()
    
    emit('replyComment', {
      articleId: props.articleId,
      commentId,
      content
    })
    
    cancelReply()
  } catch (error) {
    console.error('提交回复失败:', error)
    Toast.error('提交回复失败，请稍后重试')
  } finally {
    isCommenting.value = false
  }
}

// 取消回复
const cancelReply = () => {
  showReplyIndex.value = null
  replyInput.value = ''
  replyTarget.value = null
  showReplyEmojiPicker.value = false
}

// 表情功能
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
  showReplyEmojiPicker.value = false
}

const toggleReplyEmojiPicker = () => {
  showReplyEmojiPicker.value = !showReplyEmojiPicker.value
  showEmojiPicker.value = false
}

const insertEmoji = (emoji) => {
  commentInput.value += emoji
  focusTextarea('请输入你的评论...')
}

const insertReplyEmoji = (emoji) => {
  replyInput.value += emoji
  focusTextarea('请输入你的回复...')
}

const focusTextarea = (placeholder) => {
  setTimeout(() => {
    const textarea = document.querySelector(`textarea[placeholder="${placeholder}"]`)
    if (textarea) textarea.focus()
  }, 50)
}

// 点击外部关闭表情面板
const handleClickOutside = (event) => {
  const emojiPickers = event.target.closest('.emoji-picker-panel')
  const emojiButtons = event.target.closest('.emoji-button')
  if (!emojiPickers && !emojiButtons) {
    showEmojiPicker.value = false
    showReplyEmojiPicker.value = false
  }
}

// 登录注册处理
const handleToLogin = () => {
  store.switchAuth('login', true)
}

const handleToRegister = () => {
  store.switchAuth('register', true)
}

// 点赞功能
const handleCommentLike = async (commentId) => {
  if (!props.isLogin) {
    store.switchAuth('login', true)
    return
  }
  
  if (!commentId) return
  
  try {
    const currentState = commentLikes.value.get(commentId) ? 0 : 1
    const userId = store.login.user?.id
    
    const res = await request.post('/api/exp/like', {
      bind_id: commentId,
      bind_type: 'comment',
      state: currentState,
      description: '评论点赞',
      uid: userId
    })
    
    if (res.code === 200) {
      const newState = currentState === 1
      commentLikes.value.set(commentId, newState)
      
      const currentCount = commentLikeCounts.value.get(commentId) || 0
      const newCount = newState ? currentCount + 1 : Math.max(0, currentCount - 1)
      commentLikeCounts.value.set(commentId, newCount)
      
      Toast.success(newState ? '点赞成功！' : '已取消点赞')
    } else if (res.code === 400 && res.msg === '已经点过赞啦！') {
      commentLikes.value.set(commentId, true)
      Toast.info('已经点过赞啦！')
    } else {
      Toast.error(res.msg || '操作失败，请重试')
    }
  } catch (error) {
    console.error('评论点赞操作失败:', error)
    Toast.error('网络异常，操作失败')
  }
}

// 获取点赞数
const getCommentLikeCount = async (commentId) => {
  if (!commentId) {
    commentLikeCounts.value.set(commentId, 0)
    return
  }
  
  try {
    const whereParam = JSON.stringify({ bind_id: commentId, type: 'like', bind_type: 'comment', state: 1 })
    const res = await request.get('/api/exp/count', { where: whereParam })
    commentLikeCounts.value.set(commentId, res.code === 200 ? (res.data || 0) : 0)
  } catch (error) {
    commentLikeCounts.value.set(commentId, 0)
  }
}

// 检查点赞状态
const checkCommentLikeStatus = async (commentId) => {
  if (!props.isLogin || !commentId) return
  
  try {
    const userId = store.login.user?.id
    if (!userId) return
    
    const whereParam = JSON.stringify({ uid: userId, bind_id: commentId, type: 'like', bind_type: 'comment', state: 1 })
    const res = await request.get('/api/exp/one', { where: whereParam })
    commentLikes.value.set(commentId, res.code === 200 && !!res.data)
  } catch (error) {
    commentLikes.value.set(commentId, false)
  }
}

// 初始化点赞数据（防抖处理）
let initLikeDataTimer = null
const initCommentLikeData = async () => {
  if (initLikeDataTimer) clearTimeout(initLikeDataTimer)
  
  initLikeDataTimer = setTimeout(async () => {
    if (processedCommentList.value.length === 0) return
    
    const allCommentIds = []
    processedCommentList.value.forEach(comment => {
      if (comment.id) allCommentIds.push(comment.id)
      if (comment.replies) {
        comment.replies.forEach(reply => {
          if (reply.id) allCommentIds.push(reply.id)
        })
      }
    })
    
    await Promise.all(allCommentIds.map(async id => {
      await getCommentLikeCount(id)
      if (props.isLogin) await checkCommentLikeStatus(id)
    }))
  }, 100)
}

// 处理页码变化
const handlePageChange = (page) => {
  if (page < 1 || page > totalPages.value) return
  emit('pageChange', page)
}

// 初始化Tooltip
const initTooltip = () => {
  if (window.bootstrap) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.forEach(tooltipTriggerEl => {
      new window.bootstrap.Tooltip(tooltipTriggerEl)
    })
  }
}

// 应用评论配置
const applyCommentConfig = (config) => {
  maxCommentLength.value = config.max_length || 500
}

// 生命周期
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  initTooltip()
  
  if (!props.isDarkMode) {
    isSystemDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  
  const config = await getCommentConfig()
  commentConfig.value = config
  isCommentEnabled.value = config.enabled !== 0
  applyCommentConfig(config)
  
  try {
    const storedTime = localStorage.getItem('lastCommentTime')
    if (storedTime) lastCommentTime.value = parseFloat(storedTime) || 0
  } catch (error) {
    console.error('读取评论时间失败:', error)
  }
  
  initCommentLikeData()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (initLikeDataTimer) clearTimeout(initLikeDataTimer)
})

// 监听深色模式变化
watch([() => props.isDarkMode, isSystemDark], () => {
  if (window.bootstrap) {
    document.querySelectorAll('.tooltip').forEach(el => {
      el.classList.toggle('tooltip-dark', props.isDarkMode || isSystemDark.value)
    })
  }
})

// 监听评论列表变化
watch(
  () => props.commentList,
  () => {
    initCommentLikeData()
  },
  { deep: true }
)
</script>

<style scoped>
/* 基础样式优化 */
.avatar {
  transition: transform 0.2s ease;
  border: 2px solid rgba(var(--bs-primary-rgb), 0.1);
}

.avatar:hover {
  transform: scale(1.05);
  border-color: rgba(var(--bs-primary-rgb), 0.3);
}

.comment-item {
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: rgba(var(--bs-primary-rgb), 0.01);
}

.comment-item:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.03);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

/* 评论内容 */
.comment-item p {
  line-height: 1.6;
  font-size: 0.95rem;
  padding: 0.75rem;
  border-radius: 6px;
  background-color: rgba(var(--bs-primary-rgb), 0.02);
  transition: all 0.3s ease;
}

.comment-item p:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.04);
}

/* 回复输入框 */
.reply-form {
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 1rem;
  background-color: rgba(var(--bs-primary-rgb), 0.02);
}

/* 表情面板样式 */
.emoji-picker-panel {
  max-width: 100%;
  animation: emojiFadeIn 0.2s ease;
}

@keyframes emojiFadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.emoji-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(128, 128, 128, 0.3) transparent;
  padding: 6px;
}

.emoji-grid::-webkit-scrollbar {
  width: 6px;
}

.emoji-grid::-webkit-scrollbar-track {
  background: transparent;
}

.emoji-grid::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.3);
  border-radius: 3px;
}

.emoji-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(128, 128, 128, 0.5);
}

.emoji-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
  padding: 4px 8px;
  font-size: 14px;
  font-family: 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.15s ease;
  border-radius: 8px;
  line-height: 1.2;
  color: inherit;
  flex-shrink: 0;
}

.emoji-btn:hover {
  background: rgba(var(--bs-primary-rgb), 0.2);
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.emoji-btn:active {
  transform: scale(0.95);
}

:deep(.nav-pills .nav-link) {
  transition: all 0.2s ease;
  font-size: 0.85rem;
  font-weight: 500;
}

:deep(.nav-pills .nav-link:hover:not(.active)) {
  background: rgba(var(--bs-primary-rgb), 0.1);
  color: var(--bs-primary);
}

:deep(.nav-pills .nav-link.active) {
  box-shadow: 0 2px 4px rgba(var(--bs-primary-rgb), 0.3);
}

/* 深色模式 */
:deep(.bg-dark) {
  --bs-secondary-subtle: #2b2b2b;
  --bs-body-tertiary: #212121;
}

:deep(.tooltip-dark) {
  --bs-tooltip-bg: #333;
  --bs-tooltip-color: #fff;
}

/* 深色模式下的表情面板 */
:deep(.bg-dark) .emoji-grid {
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

:deep(.bg-dark) .emoji-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

:deep(.bg-dark) .emoji-btn {
  background: rgba(255, 255, 255, 0.08);
}

:deep(.bg-dark) .emoji-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

:deep(.bg-dark) .nav-pills .nav-link:hover:not(.active) {
  background: rgba(255, 255, 255, 0.1);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .ms-5 {
    margin-left: 1rem !important;
  }

  .avatar {
    width: 40px !important;
    height: 40px !important;
  }

  .card-body {
    padding: 1rem !important;
  }

  .comment-item {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .comment-item p {
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  .emoji-grid {
    gap: 4px;
    padding: 4px;
  }

  .emoji-btn {
    min-width: 28px;
    min-height: 28px;
    padding: 3px 6px;
    font-size: 12px;
    border-radius: 6px;
  }
}

/* 输入框焦点 */
:deep(textarea:focus) {
  border-color: var(--bs-primary) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25) !important;
  outline: none !important;
}

/* 按钮效果 */
:deep(.btn-outline-primary:hover) {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(var(--bs-primary-rgb), 0.3);
}

:deep(.btn) {
  transition: all 0.2s ease;
}

:deep(.btn:hover) {
  transform: translateY(-1px);
}

/* 加载动画 */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 评论输入框 */
:deep(.form-control) {
  transition: all 0.3s ease;
  border-radius: 8px;
  font-size: 0.95rem;
  line-height: 1.5;
}

:deep(.form-control:focus) {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
  transform: translateY(-1px);
}

/* 评论时间 */
.comment-item small {
  font-size: 0.8rem;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.comment-item:hover small {
  opacity: 1;
}

/* 徽章 */
.comment-item .badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  transition: all 0.3s ease;
}

.comment-item:hover .badge {
  transform: scale(1.05);
}

/* 回复评论 */
.reply-item {
  border-left: 3px solid rgba(var(--bs-primary-rgb), 0.2);
  padding-left: 1rem;
  margin-left: 1rem;
  margin-top: 0.75rem;
  transition: all 0.3s ease;
}

.reply-item:hover {
  border-left-color: rgba(var(--bs-primary-rgb), 0.4);
  margin-left: 1.25rem;
}

/* @提及 */
:deep(.at-mention) {
  color: var(--bs-primary);
  font-weight: 600;
  text-decoration: none;
}

/* 发布按钮 */
.publish-btn {
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.publish-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(var(--bs-primary-rgb), 0.3);
}

.publish-btn:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

/* 表情按钮 */
.emoji-button {
  transition: all 0.3s ease;
  z-index: 10;
}

.emoji-button:hover {
  transform: scale(1.1);
  border-color: var(--bs-primary);
}
</style>