<!-- 用户设置页面 -->
<template>
  <div class="card mt-2">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0 d-flex align-items-center gap-2 text-primary fw-semibold">用户设置</h5>
        <button 
          @click="fetchUserInfo" 
          class="btn btn-sm btn-outline-primary rounded-full px-4 py-1.5 transition-all hover:bg-primary hover:text-white"
          :disabled="loading"
        >
          <i class="bi" :class="loading ? 'bi-arrow-clockwise spin' : 'bi-arrow-clockwise'"></i>
          刷新
        </button>
      </div>
    </div>
    <div class="card-body">
        <!-- 导航标签 -->
        <div class="user-tabs-container mb-4">
          <ul class="nav nav-tabs user-nav-tabs" id="userSettingsTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link active" 
                id="basic-info-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#basic-info" 
                type="button" 
                role="tab" 
                aria-controls="basic-info" 
                aria-selected="true"
              >
                基础信息
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                id="account-security-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#account-security" 
                type="button" 
                role="tab" 
                aria-controls="account-security" 
                aria-selected="false"
              >
                账号安全
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                id="contact-info-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#contact-info" 
                type="button" 
                role="tab" 
                aria-controls="contact-info" 
                aria-selected="false"
              >
                联系方式
              </button>
            </li>
          </ul>
        </div>

        <!-- 标签内容 -->
        <div class="tab-content" id="userSettingsTabsContent">
          <!-- 基础信息 -->
          <div 
            class="tab-pane fade show active" 
            id="basic-info" 
            role="tabpanel" 
            aria-labelledby="basic-info-tab"
          >
            <BasicInfoSettings />
          </div>
          
          <!-- 账号安全 -->
          <div 
            class="tab-pane fade" 
            id="account-security" 
            role="tabpanel" 
            aria-labelledby="account-security-tab"
          >
            <AccountSecuritySettings />
          </div>
          
          <!-- 联系方式 -->
          <div 
            class="tab-pane fade" 
            id="contact-info" 
            role="tabpanel" 
            aria-labelledby="contact-info-tab"
          >
            <ContactInfoSettings />
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import BasicInfoSettings from '@/comps/user/settings/basic-info.vue'
import AccountSecuritySettings from '@/comps/user/settings/account-security.vue'
import ContactInfoSettings from '@/comps/user/settings/contact-info.vue'
import toast from '@/utils/toast'
import { useCommStore } from '@/store/comm'

const store = useCommStore()

// 环境变量网站标题，兜底处理
const SITE_TITLE = import.meta.env.VITE_TITLE || '朱某的生活印记'

// 获取网站标题的方法
const getSiteTitle = () => {
  return store.siteInfo?.title || SITE_TITLE
}

// 页面标题
const pageTitle = ref(`用户设置 - ${getSiteTitle()}`)

// 加载状态
const loading = ref(false)

// 计算登录状态
const isLogin = computed(() => {
  const loginState = store.getLogin
  return loginState.finish && Object.keys(loginState.user).length > 0
})

// 监听页面标题更新浏览器标签
watch(
  pageTitle,
  (newTitle) => {
    document.title = newTitle
  },
  { immediate: true }
)

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    await store.checkLoginState()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

// 检查登录状态
onMounted(async () => {
  // 手动触发登录态校验
  await store.checkLoginState()
  
  if (!isLogin.value) {
    toast.error('请先登录')
    // 跳转到首页
    window.location.href = '/'
  }
})
</script>

<style scoped>
/* 自定义样式 */
.card {
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-header {
  background-color: var(--bs-tertiary-bg);
  border-bottom: 1px solid var(--bs-border-color);
}

/* 导航标签容器 */
.user-tabs-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}

.user-tabs-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

/* 导航标签 */
.user-nav-tabs {
  border-bottom: 1px solid var(--bs-border-color);
  min-width: max-content;
}

.user-nav-tabs .nav-item {
  flex-shrink: 0;
}

.user-nav-tabs .nav-link {
  border-radius: 0.375rem 0.375rem 0 0;
  transition: all 0.2s ease;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.user-nav-tabs .nav-link.active {
  background-color: var(--bs-body-bg);
  border-color: var(--bs-border-color) var(--bs-border-color) transparent;
  color: var(--bs-primary);
  font-weight: 600;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-body {
    padding: 1rem;
  }
  
  .card-header {
    padding: 1rem;
  }
  
  .user-nav-tabs .nav-link {
    padding: 0.625rem 1rem;
    font-size: 0.8125rem;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }
}
</style>