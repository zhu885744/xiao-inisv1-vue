<!-- 用户设置页面 -->
<template>
  <div class="card mt-2">
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0 d-flex align-items-center gap-2 fw-semibold">用户设置</h5>
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import BasicInfoSettings from '@/comps/user/settings/basic-info.vue'
import AccountSecuritySettings from '@/comps/user/settings/account-security.vue'
import ContactInfoSettings from '@/comps/user/settings/contact-info.vue'
import toast from '@/utils/toast'
import cache from '@/utils/cache'
import { usePageTitle } from '@/utils/usePageTitle'

// 使用页面标题管理
const { setDynamicTitle } = usePageTitle();
setDynamicTitle('用户设置');
import { useCommStore } from '@/store/comm'

const store = useCommStore()

// 加载状态
const loading = ref(false)

// 计算登录状态
const isLogin = computed(() => {
  const loginState = store.getLogin
  return loginState.finish && Object.keys(loginState.user).length > 0
})

// 获取用户信息（添加缓存避免频繁调用）
const fetchUserInfo = async (forceRefresh = false) => {
  // 检查缓存
  const cacheKey = 'user_login_state'
  const cacheExpire = 5 // 缓存5分钟

  if (!forceRefresh) {
    const cachedState = cache.get(cacheKey)
    if (cachedState) {
      return cachedState
    }
  }

  loading.value = true
  try {
    const state = await store.checkLoginState()

    // 缓存登录状态
    if (state.finish && Object.keys(state.user).length > 0) {
      cache.set(cacheKey, state, cacheExpire)
    }

    return state
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  } finally {
    loading.value = false
  }
}

// 组件挂载时的逻辑
onMounted(async () => {
  // 检查登录状态
  const loginState = await fetchUserInfo()

  if (!loginState || !loginState.finish || Object.keys(loginState.user).length === 0) {
    toast.error('请先登录')
    // 跳转到首页
    window.location.href = '/'
  }
})
</script>
