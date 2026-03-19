<template>
  <!-- 侧边栏遮罩层 -->
  <div 
    v-if="props.sidebarOpen" 
    class="sidebar-overlay" 
    @click="$emit('update:sidebarOpen', false)"
  ></div>
  
  <!-- 侧边栏（固定左侧） -->
  <aside class="main-menu" :class="{ open: props.sidebarOpen }">
    <div class="menu-header">
      <router-link class="menu-brand" to="/admin" @click="$emit('update:sidebarOpen', false)">
        <img 
          v-if="store.comm.siteInfo?.avatar" 
          :src="store.comm.siteInfo.avatar" 
          alt="网站图标" 
          class="menu-logo"
        >
        <span v-else class="fw-bold">后台管理面板</span>
      </router-link>
      <!-- 移动端关闭按钮 -->
      <button 
        class="menu-close-btn d-lg-none" 
        @click="$emit('update:sidebarOpen', false)"
      >
        <i class="bi bi-x"></i>
      </button>
    </div>
    <nav class="menu-nav">
      <ul class="menu-list">
        <!-- 控制台 -->
        <li class="menu-item">
          <router-link 
            class="menu-link" 
            to="/admin" 
            active-class="active" 
            exact-active-class="active"
            @click="$emit('update:sidebarOpen', false)"
          >
            <span>控制台</span>
          </router-link>
        </li>
        
        <!-- 动态生成菜单项 -->
        <li v-for="menu in menuList" :key="menu.name" class="menu-item">
          <div 
            class="menu-link dropdown-toggle" 
            @click="toggleDropdown(menu.name)"
          >
            <span>{{ menu.label }}</span>
          </div>
          <!-- 子菜单 -->
          <ul class="menu-sub-list" v-show="dropdownOpen[menu.name]">
            <li v-for="child in menu.children" :key="child.path" class="menu-sub-item">
              <router-link 
                class="menu-sub-link" 
                :to="child.path"
                active-class="active"
                @click="$emit('update:sidebarOpen', false)"
              >
                <i class="bi bi-circle-fill me-2" style="font-size: 6px;"></i>
                <span>{{ child.label }}</span>
              </router-link>
            </li>
          </ul>
        </li>
        
        <!-- 返回前台 -->
        <li class="menu-item">
          <router-link 
            class="menu-link" 
            to="/" 
            active-class="active" 
            exact-active-class="active"
            @click="$emit('update:sidebarOpen', false)"
          >
            <span>返回前台</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <!-- 用户信息卡片 - 固定在侧边栏底部 -->
    <div class="user">
      <div class="card border-0 shadow-sm text-bg-light">
        <div class="card-body p-3">
          <div class="d-flex align-items-center">
            <div class="flex-shrink-0">
              <img 
                  :src="userInfo?.avatar || defaultAvatar" 
                  alt="用户头像" 
                  class="rounded-circle"
                  style="width: 40px; height: 40px; object-fit: cover;"
                  @error="handleAvatarError"
                >
            </div>
            <div class="flex-grow-1 ms-3 overflow-hidden">
              <div class="text-truncate fw-semibold">
                {{ userInfo?.nickname || userInfo?.username || '用户' }}
              </div>
              <small class="text-muted text-truncate d-block">
                {{ userGroups[0]?.name || '普通用户' }}
              </small>
            </div>
            <div class="flex-shrink-0">
              <button 
                class="btn btn-sm btn-outline-danger rounded-3" 
                title="退出登录"
                @click="handleLogout"
              >
                <i class="bi bi-box-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/request'
import { list as getMenuList } from '@/utils/menu'
import { useCommStore } from '@/store/comm'
import Toast from '@/utils/toast'
import defaultAvatar from '@/assets/img/avatar.png'

// 导航项数据
const props = defineProps({
  sidebarOpen: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits(['update:sidebarOpen'])

const menuList = ref([])
const dropdownOpen = ref({})

// 存储
const store = {
  comm: useCommStore()
}

// 用户信息
const userInfo = computed(() => {
  return store.comm.login.user || {}
})

// 用户组信息
const userGroups = computed(() => {
  const authInfo = userInfo.value?.result?.auth
  if (!authInfo) {
    return [{ name: '普通用户' }]
  }
  
  if (authInfo.group?.list && authInfo.group.list.length > 0) {
    return authInfo.group.list
  }
  
  return [{ name: '普通用户' }]
})

// 路由
const router = useRouter()

// 处理头像错误
const handleAvatarError = (event) => {
  event.target.src = defaultAvatar
}

// 退出登录
const handleLogout = async () => {
  try {
    const response = await axios.del('/api/comm/logout')
    
    if (response.code === 200) {
      // 清理状态
      store.comm.login.finish = false
      store.comm.login.user = null
      
      // 清理缓存
      localStorage.removeItem('user-info')
      
      Toast.success('已退出登录')
      // 跳转到首页
      router.push('/')
    } else {
      Toast.error(response.msg || '退出登录失败')
    }
  } catch (error) {
    Toast.error('网络异常，已本地退出登录')
    // 兜底清理
    store.comm.login.finish = false
    store.comm.login.user = null
    router.push('/')
  }
}

// 初始化下拉菜单状态
const initDropdownState = () => {
  menuList.value.forEach(menu => {
    dropdownOpen.value[menu.name] = false
  })
}

// 切换下拉菜单
const toggleDropdown = (menuName) => {
  // 关闭所有其他下拉菜单
  Object.keys(dropdownOpen.value).forEach(key => {
    if (key !== menuName) {
      dropdownOpen.value[key] = false
    }
  })
  
  // 切换当前下拉菜单
  dropdownOpen.value[menuName] = !dropdownOpen.value[menuName]
}

// 从store获取站点信息
const fetchSiteInfo = async () => {
  try {
    await store.comm.fetchSiteInfo()
  } catch (error) {
    // console.error('获取站点信息失败:', error)
  }
}

// 获取菜单数据
const fetchMenuList = async () => {
  try {
    const menuData = await getMenuList()
    menuList.value = menuData
    initDropdownState()
  } catch (error) {
    console.error('获取菜单数据失败:', error)
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchSiteInfo()
  await fetchMenuList()
})
</script>

<style scoped>
/* 侧边栏遮罩层 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  transition: opacity 0.3s ease;
}

/* 侧边栏样式 */
.main-menu {
  width: 250px;
  min-width: 250px;
  max-width: 250px;
  background-color: var(--bs-body-bg);
  border-right: 1px solid var(--bs-border-color);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

/* 侧边栏头部 */
.menu-header {
  padding: 1rem;
  border-bottom: 1px solid var(--bs-border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--bs-primary);
  font-weight: 600;
  flex-grow: 1;
}

.menu-logo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 0.75rem;
  object-fit: cover;
}

/* 侧边栏关闭按钮 */
.menu-close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--bs-body-color);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.menu-close-btn:hover {
  background-color: var(--bs-secondary-bg-subtle);
  color: var(--bs-primary);
}

/* 侧边栏导航 */
.menu-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  margin-bottom: 0.25rem;
}

.menu-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: var(--bs-body-color);
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  position: relative;
}

.menu-link:hover {
  background-color: var(--bs-secondary-bg-subtle);
  color: var(--bs-primary);
}

.menu-link.active {
  background-color: var(--bs-primary-bg-subtle);
  color: var(--bs-primary);
  border-left-color: var(--bs-primary);
}

/* 下拉菜单 */
.dropdown-toggle {
  cursor: pointer;
}

/* 子菜单 */
.menu-sub-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: var(--bs-tertiary-bg);
  border-left: 3px solid var(--bs-border-color);
}

.menu-sub-item {
  margin: 0;
}

.menu-sub-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 1.5rem 0.5rem 2.75rem;
  color: var(--bs-body-color);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
}

.menu-sub-link:hover {
  background-color: var(--bs-secondary-bg-subtle);
  color: var(--bs-primary);
}

.menu-sub-link.active {
  background-color: var(--bs-primary-bg-subtle);
  color: var(--bs-primary);
}

/* 响应式设计 */
@media (max-width: 991.98px) {
  .main-menu {
    transform: translateX(-100%);
  }
  
  .main-menu.open {
    transform: translateX(0);
  }
}

/* 滚动条样式 */
.main-menu::-webkit-scrollbar {
  width: 6px;
}

.main-menu::-webkit-scrollbar-track {
  background: var(--bs-tertiary-bg);
}

.main-menu::-webkit-scrollbar-thumb {
  background-color: var(--bs-border-color);
  border-radius: 3px;
}

.main-menu::-webkit-scrollbar-thumb:hover {
  background-color: var(--bs-secondary-color);
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .main-menu {
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
  }
}
</style>