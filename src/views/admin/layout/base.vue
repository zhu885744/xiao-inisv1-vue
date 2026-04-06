<template>
    <div class="layout-wrapper">
        <!-- 侧边栏（固定左侧） -->
        <admin-nav v-model:sidebar-open="sidebarOpen"></admin-nav>
        
        <!-- 右侧内容容器 -->
        <div class="page-content">
            <!-- 顶部导航栏（固定顶部） -->
            <nav class="navbar-custom">
                <div class="navbar-content">
                    <!-- 移动端菜单按钮 -->
                    <button 
                        class="navbar-toggle d-lg-none" 
                        @click="toggleSidebar"
                    >
                        <i class="bi bi-list"></i>
                    </button>
                    
                    <!-- 面包屑导航 -->
                    <nav aria-label="breadcrumb" class="breadcrumb-container">
                        <ol class="breadcrumb mb-0">
                            <li class="breadcrumb-item">
                                <router-link to="/admin" class="text-decoration-none">控制台</router-link>
                            </li>
                            <li class="breadcrumb-item active" aria-current="page">
                                {{ currentPageName }}
                            </li>
                        </ol>
                    </nav>
                    
                    <!-- 右侧功能区域 -->
                    <div class="navbar-right">
                        <!-- 深色/浅色模式切换按钮 -->
                        <button 
                            class="btn btn-outline-secondary me-2" 
                            type="button" 
                            @click="toggleDarkMode"
                            :title="isDarkMode ? '切换到浅色模式' : '切换到深色模式'"
                        >
                            <i :class="darkModeIcon"></i>
                        </button>
                        
                        <!-- 返回前台按钮 -->
                        <router-link 
                            class="btn btn-outline-secondary" 
                            to="/"
                            title="返回前台"
                        >
                            <i class="bi bi-house"></i>
                        </router-link>
                    </div>
                </div>
            </nav>

            <!-- 业务内容容器 -->
            <div class="container-fluid">
              <router-view></router-view>
            </div>
            
            <!-- 页脚（底部） -->
            <footer class="footer">
                <admin-footer></admin-footer>
            </footer>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AdminNav from './nav.vue'
import AdminFooter from './footer.vue'
import { useCommStore } from '@/store/comm'
import { useAuthPagesStore } from '@/store/auth-pages'
import { useRouter } from 'vue-router'

// 初始化router
const router = useRouter()

// 导航项数据
const sidebarOpen = ref(false)

// 存储
const store = {
  comm: useCommStore(),
  authPages: useAuthPagesStore()
}

// 计算属性
const isDarkMode = computed(() => store.comm.isDarkMode)

const darkModeIcon = computed(() => {
  return isDarkMode.value ? 'bi bi-brightness-high-fill' : 'bi bi-brightness-high'
})

// 当前页面名称
const currentPageName = computed(() => {
  const route = router.currentRoute.value
  const path = route.path
  
  // 特殊处理控制台页面
  if (path === '/admin') {
    return '控制台'
  }
  
  // 从 API 获取页面信息
  const authPagesFlat = store.authPages.getFlat
  
  // 根据路径查找页面名称
  if (Array.isArray(authPagesFlat)) {
    const page = authPagesFlat.find(item => item.path === path)
    if (page && page.name) {
      return page.name
    }
  }
  
  // 默认返回控制台
  return '控制台'
})

// 切换深色/浅色模式
const toggleDarkMode = () => {
  store.comm.toggleDarkMode()
}

// 切换侧边栏
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<style scoped>
/* 整体布局容器 */
.layout-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: var(--bs-body-bg);
}

/* 右侧内容容器 */
.page-content {
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: all 0.3s ease;
}

/* 响应式布局调整 */
@media (max-width: 991.98px) {
  .page-content {
    margin-left: 0;
  }
  
  .navbar-custom {
    padding: 0.5rem 1rem;
  }
}

/* 顶部导航栏 */
.navbar-custom {
  background-color: var(--bs-body-bg);
  border-bottom: 1px solid var(--bs-border-color);
  padding: 0.75rem 1rem;
  position: sticky;
  top: 0;
  z-index: 999;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .navbar-custom {
    box-shadow: 0 2px 4px rgba(255, 255, 255, 0.05);
  }
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.breadcrumb-container {
  flex: 1;
  margin-left: 1rem;
}

.breadcrumb {
  font-size: 0.875rem;
}

.breadcrumb-item a {
  color: var(--bs-primary);
}

.breadcrumb-item a:hover {
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: var(--bs-body-color);
}

.navbar-right {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.navbar-toggle {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--bs-body-color);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.navbar-right {
  display: flex;
  align-items: center;
}

/* 内容内边距容器 */
.px-3 {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 991.98px) {
  .page-content {
    margin-left: 0;
  }
}
</style>