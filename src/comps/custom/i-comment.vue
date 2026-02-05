<!-- src/comps/CommentList.vue 评论通用组件（适配深色模式+UI优化） -->
<template>
  <div class="card shadow-sm border-0 rounded-3 bg-body-tertiary">
    <!-- 评论区标题：接收props的评论数，动态展示 -->
    <div class="card-header border-0 bg-transparent">
      <h3 class="h5 fw-bold mt-2">
        <i class="bi bi-chat-dots me-2 text-primary"></i>
        评论 ({{ commentCount || 0 }})
      </h3>
    </div>
    <div class="card-body">
      <!-- 评论输入框：仅登录状态显示 -->
      <div class="mb-5" v-if="isLogin">
        <textarea 
          v-model="commentInput"
          class="form-control rounded-2 border border-secondary-subtle bg-body" 
          rows="3" 
          placeholder="请输入你的评论..."
          :class="{ 'bg-dark border-dark-subtle': isDarkMode }"
        ></textarea>
        <button 
          @click="handlePublish"
          class="btn btn-primary mt-3 px-4 rounded-2"
          :disabled="!commentInput.trim()"
        >
          <i class="bi bi-paper-plane-fill me-1"></i> 发布评论
        </button>
      </div>

      <!-- 未登录引导区：Bootstrap 深色模式适配 -->
      <div class="mb-5 p-4 bg-body rounded-3 text-center border" v-else>
        <i class="bi bi-person-circle fs-3 text-primary mb-2"></i>
        <p class="mb-3 text-muted">登录后即可发表评论～</p>
        <div class="d-flex gap-2 justify-content-center">
          <button 
            @click="emit('toLogin')"
            class="btn btn-primary btn-sm px-4 rounded-2"
          >
            <i class="bi bi-box-arrow-in-right me-1"></i> 登录
          </button>
          <button 
            @click="emit('toRegister')"
            class="btn btn-outline-primary btn-sm px-4 rounded-2"
          >
            <i class="bi bi-person-plus me-1"></i> 注册
          </button>
        </div>
      </div>

      <!-- 评论列表：接收props的评论数据，无数据时展示提示 -->
      <div class="comments-list" v-if="commentList.length > 0">
        <div 
          class="comment-item pb-4 mb-4 border-bottom border-secondary-subtle"
          v-for="(item, index) in commentList" 
          :key="index"
        >
          <div class="d-flex align-items-start mb-3">
            <img 
              :src="item.avatar || 'https://picsum.photos/60/60'" 
              class="avatar rounded-circle me-3 border border-light shadow-sm" 
              alt="用户头像"
              style="width: 50px; height: 50px; object-fit: cover;"
            >
            <div class="flex-grow-1">
              <h6 class="fw-semibold mb-1">{{ item.nickname || '匿名用户' }}</h6>
              <small class="text-muted">{{ item.time || '未知时间' }}</small>
              <span v-if="item.isAuthor" class="badge bg-primary text-white ms-2 rounded-pill">作者</span>
            </div>
          </div>
          <p class="text-secondary mb-3 px-2 py-1 rounded-2 bg-body-tertiary">{{ item.content }}</p>
          
          <!-- 回复按钮组：优化交互 -->
          <div class="d-flex gap-2">
            <button 
              class="btn btn-sm btn-outline-primary rounded-2" 
              @click="handleReply(index)"
              v-if="isLogin"
            >
              <i class="bi bi-reply-fill me-1"></i> 回复
            </button>
            <button 
              class="btn btn-sm btn-outline-secondary rounded-2 disabled" 
              v-else
              data-bs-toggle="tooltip"
              data-bs-title="登录后可回复"
            >
              <i class="bi bi-reply-fill me-1"></i> 回复
            </button>
          </div>

          <!-- 评论回复：嵌套展示，优化深色模式适配 -->
          <div 
            class="ms-5 mt-3 pt-3 border-top border-secondary-subtle"
            v-for="(reply, rIndex) in item.replies" 
            :key="rIndex"
          >
            <div class="d-flex align-items-start mb-3">
              <img 
                :src="reply.avatar || 'https://picsum.photos/62/62'" 
                class="avatar rounded-circle me-3 border border-light shadow-sm" 
                alt="回复用户头像"
                style="width: 45px; height: 45px; object-fit: cover;"
              >
              <div class="flex-grow-1">
                <h6 class="fw-semibold mb-1">
                  {{ reply.nickname || '匿名用户' }}
                  <span v-if="reply.isAuthor" class="badge bg-primary text-white ms-2 rounded-pill">作者</span>
                </h6>
                <small class="text-muted">{{ reply.time || '未知时间' }}</small>
              </div>
            </div>
            <p class="text-secondary mb-3 px-2 py-1 rounded-2 bg-body-tertiary">{{ reply.content }}</p>
            
            <!-- 回复按钮组 -->
            <div class="d-flex gap-2">
              <button 
                class="btn btn-sm btn-outline-primary rounded-2" 
                v-if="isLogin"
              >
                <i class="bi bi-reply-fill me-1"></i> 回复
              </button>
              <button 
                class="btn btn-sm btn-outline-secondary rounded-2 disabled" 
                v-else
                data-bs-toggle="tooltip"
                data-bs-title="登录后可回复"
              >
                <i class="bi bi-reply-fill me-1"></i> 回复
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 无评论提示：优化深色模式和视觉体验 -->
      <div v-else class="text-center py-5 text-muted">
        <p class="mb-0 h6">暂无评论，快来抢沙发吧～</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, watch } from 'vue'

// 🌟 1. 定义组件接收的props
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
  // 新增：接收深色模式状态（可选，自动检测兜底）
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

// 🌟 2. 定义组件向外触发的事件
const emit = defineEmits(['publishComment', 'replyComment', 'toLogin', 'toRegister'])

// 🌟 3. 组件内部响应式状态
const commentInput = ref('')
// 自动检测系统深色模式（兜底方案）
const isSystemDark = ref(false)

// 🌟 4. 发布评论处理
const handlePublish = () => {
  const content = commentInput.value.trim()
  if (!content) return
  emit('publishComment', {
    articleId: props.articleId,
    content
  })
  commentInput.value = ''
}

// 🌟 5. 回复评论处理
const handleReply = (index) => {
  if (!props.isLogin) return
  emit('replyComment', {
    articleId: props.articleId,
    commentIndex: index
  })
  // 优化回复体验：自动填充回复前缀并聚焦
  commentInput.value = `回复 #${index+1}：`
  setTimeout(() => {
    const textarea = document.querySelector('textarea[placeholder="请输入你的评论..."]')
    if (textarea) {
      textarea.focus()
      textarea.setSelectionRange(commentInput.value.length, commentInput.value.length)
    }
  }, 100)
}

// 🌟 6. 初始化Bootstrap tooltip + 检测系统深色模式
onMounted(() => {
  // 初始化tooltip
  if (window.bootstrap) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.forEach(tooltipTriggerEl => {
      new window.bootstrap.Tooltip(tooltipTriggerEl)
    })
  }

  // 检测系统深色模式（兜底）
  if (!props.isDarkMode) {
    isSystemDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
})

// 🌟 7. 监听深色模式变化，更新tooltip样式
watch([() => props.isDarkMode, isSystemDark], () => {
  if (window.bootstrap) {
    document.querySelectorAll('.tooltip').forEach(el => {
      el.classList.toggle('tooltip-dark', props.isDarkMode || isSystemDark.value)
    })
  }
})
</script>

<style scoped>
/* 基础样式优化 + 深色模式适配 */
.avatar {
  transition: transform 0.2s ease;
}

.avatar:hover {
  transform: scale(1.05);
}

.comment-item {
  transition: background-color 0.2s ease;
}

.comment-item:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.02);
}

/* 深色模式专属样式 */
:deep(.bg-dark) {
  --bs-secondary-subtle: #2b2b2b;
  --bs-body-tertiary: #212121;
}

:deep(.tooltip-dark) {
  --bs-tooltip-bg: #333;
  --bs-tooltip-color: #fff;
}

/* 移动端适配增强 */
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
}

/* 输入框焦点样式优化 */
:deep(textarea:focus) {
  border-color: var(--bs-primary) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25) !important;
  outline: none !important;
}

/* 按钮hover效果增强 */
:deep(.btn-outline-primary:hover) {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

/* 无评论提示动画 */
:deep(.bi-chat-square-dots) {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>