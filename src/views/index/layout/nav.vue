<template>
  <!-- 顶部导航栏 -->
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container">
      <!-- 网站标题：跳首页 -->
      <router-link class="navbar-brand" to="/">朱某的生活印记</router-link>

      <!-- 移动端侧边栏触发按钮 -->
      <button 
        class="navbar-toggler d-lg-none" 
        type="button" 
        @click="toggleSidebar"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- PC端导航内容 -->
      <div class="collapse navbar-collapse d-none d-lg-flex" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <!-- 首页 -->
          <li class="nav-item">
            <router-link class="nav-link" aria-current="page" to="/" active-class="active" exact-active-class="active">
              首页
            </router-link>
          </li>

          <!-- 分类下拉列表 -->
          <li class="nav-item dropdown" ref="pcDropdownRef">
            <a class="nav-link dropdown-toggle" role="button" aria-expanded="false" data-bs-toggle="dropdown">
              分类
            </a>
            <ul class="dropdown-menu">
              <li v-for="category in categories" :key="category.id" class="dropdown-item p-0">
                <router-link class="nav-link d-block w-100 h-100 py-2 px-4 text-decoration-none" :to="`/category/${category.key}`">
                  {{ category.name }}
                </router-link>
              </li>
              <li v-if="categories.length === 0" class="dropdown-item text-muted">
                暂无分类数据
              </li>
            </ul>
          </li>

          <!-- 动态渲染的导航项 -->
          <li v-for="item in navItems" :key="item.key" class="nav-item">
            <router-link class="nav-link" :to="`/${item.key}`" active-class="active" exact-active-class="active">
              {{ item.title }}
            </router-link>
          </li>
        </ul>
        
        <!-- 右侧功能区域 -->
        <div class="d-flex align-items-center">
          <!-- 搜索按钮 -->
          <button class="btn btn-outline-secondary me-2" type="button">
            <i class="bi bi-search"></i>
          </button>
          
          <!-- 深色/浅色模式切换按钮 -->
          <button 
            class="btn btn-outline-secondary me-2" 
            type="button" 
            @click="toggleDarkMode"
            :title="isDarkMode ? '切换到浅色模式' : '切换到深色模式'"
          >
            <i :class="darkModeIcon"></i>
          </button>
          
          <!-- 用户相关功能 -->
          <div class="d-flex align-items-center" v-if="store.comm.login.finish && store.comm.login.user">
            <!-- 已登录用户信息 -->
            <div class="dropdown" ref="userDropdownRef">
              <button 
                class="btn btn-outline-secondary dropdown-toggle d-flex align-items-center" 
                type="button" 
                id="userDropdownMenu"
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                @click="toggleUserDropdown"
              >
                <i class="bi bi-person-circle me-1"></i>
                <span class="text-truncate" style="max-width: 100px;">
                  {{ store.comm.login.user.nickname || store.comm.login.user.account }}
                </span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdownMenu" :class="{ 'show': userDropdownOpen }">
                <li>
                  <router-link class="dropdown-item" to="/account/home">
                    <i class="bi bi-person me-1"></i>用户中心
                  </router-link>
                </li>
                <li v-if="store.comm.login.user.role === 'admin'">
                  <router-link class="dropdown-item" to="/admin">
                    <i class="bi bi-gear me-1"></i>后台管理
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <button class="dropdown-item text-danger" @click="method.logout()">
                    <i class="bi bi-box-arrow-right me-1"></i>退出登录
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div class="d-flex" v-else>
            <!-- 未登录状态 -->
            <button class="btn btn-outline-primary me-2" @click="method.showLogin()">
              登录
            </button>
            <button 
              v-if="parseInt(store.config.getAllowRegister?.value) === 1" 
              class="btn btn-outline-success"
              @click="method.showRegister()"
            >
              注册
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- 移动端侧边栏 -->
  <div 
    class="sidebar offcanvas offcanvas-start" 
    tabindex="-1" 
    id="mobileSidebar"
    aria-labelledby="mobileSidebarLabel"
  >
    <div class="offcanvas-header border-bottom">
      <h5 class="offcanvas-title" id="mobileSidebarLabel">朱某的生活印记</h5>
      <button 
        type="button" 
        class="btn-close" 
        @click="closeSidebar"
        aria-label="Close"
      ></button>
    </div>
    <div class="offcanvas-body d-flex flex-column">
      <!-- 移动端导航菜单 -->
      <ul class="navbar-nav flex-grow-1">
        <!-- 首页 -->
        <li class="nav-item mb-2">
          <router-link 
            class="nav-link" 
            to="/" 
            active-class="active" 
            exact-active-class="active"
            @click="closeSidebar"
          >
            首页
          </router-link>
        </li>

        <!-- 分类菜单 -->
        <li class="nav-item mb-2">
          <a 
            class="nav-link d-flex justify-content-between align-items-center" 
            href="javascript:;" 
            @click="toggleCategoryDropdown"
          >
            分类
            <i :class="categoryDropdownOpen ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
          </a>
          <!-- 分类子菜单 -->
          <ul class="navbar-nav ms-3 mt-2" v-show="categoryDropdownOpen">
            <li v-for="category in categories" :key="category.id" class="nav-item mb-1">
              <router-link 
                class="nav-link" 
                :to="`/category/${category.key}`"
                @click="closeSidebar"
              >
                {{ category.name }}
              </router-link>
            </li>
            <li v-if="categories.length === 0" class="nav-item text-muted small">
              暂无分类数据
            </li>
          </ul>
        </li>

        <!-- 动态导航项 -->
        <li v-for="item in navItems" :key="item.key" class="nav-item mb-2">
          <router-link 
            class="nav-link" 
            :to="`/${item.key}`" 
            active-class="active" 
            exact-active-class="active"
            @click="closeSidebar"
          >
            {{ item.title }}
          </router-link>
        </li>
      </ul>

      <!-- 移动端功能按钮组 -->
      <div class="mt-auto pt-3 border-top">
        <!-- 未登录状态 -->
        <div v-if="!store.comm.login.user" class="d-flex flex-column gap-2">
          <button class="btn btn-outline-primary w-100" type="button" @click="method.showLogin()">
            <i class="bi bi-person-circle me-1"></i>登录
          </button>
          <button 
            v-if="parseInt(store.config.getAllowRegister?.value) === 1"
            class="btn btn-outline-success w-100" 
            type="button" 
            @click="method.showRegister()"
          >
            注册账号
          </button>
          <button class="btn btn-link w-100 text-decoration-none" type="button" @click="method.showResetPassword()">
            忘记密码？
          </button>
        </div>
        
        <!-- 已登录状态 -->
        <div v-else class="d-flex flex-column gap-2">
          <div class="text-center mb-2">
            <i class="bi bi-person-circle fs-4 text-success"></i>
            <div class="mt-1">{{ store.comm.login.user.nickname }}</div>
            <small class="text-muted">{{ store.comm.login.user.email }}</small>
          </div>
          <router-link class="btn btn-outline-secondary w-100" to="/account/home" @click="closeSidebar">
            个人中心
          </router-link>
          <router-link v-if="store.comm.login.user.role === 'admin'" class="btn btn-outline-warning w-100" to="/admin" @click="closeSidebar">
            后台管理
          </router-link>
          <button class="btn btn-outline-danger w-100" type="button" @click="method.logout()">
            退出登录
          </button>
        </div>
        
        <!-- 其他功能按钮 -->
        <div class="d-flex gap-2 mt-3">
          <button class="btn btn-outline-secondary flex-grow-1" type="button">
            <i class="bi bi-search me-1"></i>搜索
          </button>
          <button 
            class="btn btn-outline-secondary flex-grow-1" 
            type="button" 
            @click="toggleDarkMode"
          >
            <i :class="[darkModeIcon, 'me-1']"></i>{{ isDarkMode ? '浅色' : '深色' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 侧边栏遮罩层 -->
  <div 
    v-if="sidebarOpen"
    class="sidebar-backdrop"
    @click="closeSidebar"
  ></div>
  
  <!-- 引入三个对话框组件 -->
  <DialogLogin ref="loginDialog" @finish="method.onLoginFinish" />
  <DialogRegister ref="registerDialog" @finish="method.onRegisterFinish" />
  <DialogResetPassword ref="resetDialog" @finish="method.onResetFinish" />
</template>

<script setup>
import { ref, onMounted, computed, nextTick, reactive, watch, onUpdated, defineExpose } from 'vue'
import axios from '@/utils/request'
import utils from '@/utils/utils'
import { useRouter } from 'vue-router'
import { useCommStore } from '@/store/comm'
import { useConfigStore } from '@/store/config'

// 引入三个对话框组件
import DialogLogin from '@/comps/index/dialog/login.vue'
import DialogRegister from '@/comps/index/dialog/register.vue'
import DialogResetPassword from '@/comps/index/dialog/reset-password.vue'

// 初始化router
const router = useRouter()

// 导航项数据
const navItems = ref([])
const categories = ref([])
const isDarkMode = ref(false)
const sidebarOpen = ref(false)
const categoryDropdownOpen = ref(false)
const userDropdownOpen = ref(false)

// Refs for dropdowns
const pcDropdownRef = ref(null)
const userDropdownRef = ref(null)

// 组件引用
const loginDialog = ref(null)
const registerDialog = ref(null)
const resetDialog = ref(null)

// 存储
const store = {
  comm: useCommStore(),
  config: useConfigStore()
}

// 状态管理
const state = reactive({
  theme: 'white',
  drawer: {
    show: false,
    menu: true
  },
  nav: {
    name: 'index',
    color: {
      active: 'rgb(var(--assist-color))',
      inactive: 'rgb(var(--vice-font-color))',
    }
  },
})

// 导入Toast
import Toast from '@/utils/toast'

// 方法定义
const method = {
  // 显示对话框
  showLogin: () => {
    if (loginDialog.value && loginDialog.value.show) {
      loginDialog.value.show()
    }
  },
  
  showRegister: () => {
    if (registerDialog.value && registerDialog.value.show) {
      registerDialog.value.show()
    }
  },
  
  showResetPassword: () => {
    if (resetDialog.value && resetDialog.value.show) {
      resetDialog.value.show()
    }
  },
  
  // 事件处理
  onLoginFinish: (user) => {
    console.log('登录成功:', user)
    store.comm.login.finish = true
    store.comm.login.user = user
    closeSidebar()
    // 登录成功提示
    Toast.success('登录成功')
    // 重新初始化下拉菜单（用户登录后）
    nextTick(() => {
      initDropdowns()
    })
  },
  
  onRegisterFinish: (user) => {
    console.log('注册成功:', user)
    // 注册成功提示
    Toast.success('注册成功，请登录')
    method.showLogin()
  },
  
  onResetFinish: () => {
    console.log('密码重置成功')
    // 密码重置成功提示
    Toast.success('密码重置成功，请登录')
    method.showLogin()
  },
  
  // 登出（核心修改：适配后端 DELETE /api/comm/logout 接口）
  logout: async () => {
    try {
      // 1. 调用后端退出登录接口（DELETE 请求）
      const response = await axios.del('/api/comm/logout')
      
      // 2. 处理接口响应（根据后端返回状态码判断）
      if (response.code === 200) {
        // 接口调用成功 - 清理前端状态
        utils.set.cookie(globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN', '', -1)
        store.comm.login.finish = false
        store.comm.login.user = null
        
        // 清理本地缓存的用户信息
        if (utils.cache?.del) {
          utils.cache.del('user-info')
        } else if (localStorage) {
          localStorage.removeItem('user-info')
        }
        
        // 成功提示
        Toast.success('已退出登录')
      } else {
        // 接口返回错误
        Toast.error(response.msg || '退出登录失败')
      }
    } catch (error) {
      // 网络错误/接口调用失败
      console.error('退出登录接口调用失败:', error)
      
      // 兜底清理前端状态（即使接口失败，也清理本地Token）
      utils.set.cookie(globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN', '', -1)
      store.comm.login.finish = false
      store.comm.login.user = null
      
      // 错误提示
      Toast.error('网络异常，已本地退出登录')
    } finally {
      // 无论成功失败，都关闭侧边栏
      closeSidebar()
      // 可选：登出后跳转到首页
      // router.push('/')
    }
  },
  
  // 获取当前主题
  async getTheme() {
    let theme = document.querySelector('body').getAttribute('inis-theme')
    if (!utils.is.empty(theme)) {
      if (theme.indexOf('white') !== -1) state.theme = 'white'
      else state.theme = 'dark'
    }
  },
  
  // 路由跳转 - 关闭抽屉
  push: (params = {}) => {
    router.push(params)
    state.drawer.show = false
  },
}

// 暴露方法给父组件
defineExpose({
  method,
  store
})

// 初始化下拉菜单
const initDropdowns = () => {
  // 等待 DOM 更新完成
  nextTick(() => {
    // 初始化分类下拉菜单
    if (pcDropdownRef.value && window.bootstrap) {
      const trigger = pcDropdownRef.value.querySelector('.dropdown-toggle')
      if (trigger) {
        try {
          // 确保每个下拉菜单只初始化一次
          if (!trigger._dropdown) {
            trigger._dropdown = new window.bootstrap.Dropdown(trigger)
          }
        } catch (e) {
          console.warn('分类下拉初始化失败:', e)
        }
      }
    }
    
    // 初始化用户下拉菜单
    if (userDropdownRef.value && window.bootstrap) {
      const trigger = userDropdownRef.value.querySelector('.dropdown-toggle')
      if (trigger) {
        try {
          if (!trigger._dropdown) {
            trigger._dropdown = new window.bootstrap.Dropdown(trigger)
          }
        } catch (e) {
          console.warn('用户下拉初始化失败:', e)
        }
      }
    }
  })
}

// 计算属性
const darkModeIcon = computed(() => {
  return isDarkMode.value ? 'bi bi-brightness-high-fill' : 'bi bi-brightness-high'
})

// 切换深色/浅色模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  
  // 更新HTML的data-bs-theme属性
  const htmlElement = document.documentElement
  htmlElement.setAttribute('data-bs-theme', isDarkMode.value ? 'dark' : 'light')
  
  // 保存用户偏好到localStorage
  localStorage.setItem('preferred-theme', isDarkMode.value ? 'dark' : 'light')
  
  console.log(`已切换到${isDarkMode.value ? '深色' : '浅色'}模式`)
}

// 初始化主题
const initTheme = () => {
  // 从localStorage获取用户偏好
  const savedTheme = localStorage.getItem('preferred-theme')
  
  if (savedTheme) {
    // 使用用户保存的偏好
    isDarkMode.value = savedTheme === 'dark'
  } else {
    // 如果没有保存的偏好，使用系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDarkMode.value = prefersDark
  }
  
  // 应用主题
  const htmlElement = document.documentElement
  htmlElement.setAttribute('data-bs-theme', isDarkMode.value ? 'dark' : 'light')
  
  console.log(`初始化${isDarkMode.value ? '深色' : '浅色'}模式`)
}

// 监听系统主题变化
const setupSystemThemeListener = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleThemeChange = (e) => {
    // 只有当用户没有保存偏好时才跟随系统变化
    if (!localStorage.getItem('preferred-theme')) {
      isDarkMode.value = e.matches
      const htmlElement = document.documentElement
      htmlElement.setAttribute('data-bs-theme', e.matches ? 'dark' : 'light')
      console.log(`系统主题已切换，跟随系统到${e.matches ? '深色' : '浅色'}模式`)
    }
  }
  
  // 添加监听
  mediaQuery.addEventListener('change', handleThemeChange)
  
  // 返回清理函数
  return () => mediaQuery.removeEventListener('change', handleThemeChange)
}

// 切换移动端侧边栏
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
  const sidebar = document.getElementById('mobileSidebar')
  if (sidebarOpen.value) {
    sidebar.classList.add('show')
    document.body.classList.add('sidebar-open')
  } else {
    sidebar.classList.remove('show')
    document.body.classList.remove('sidebar-open')
  }
}

// 关闭侧边栏
const closeSidebar = () => {
  sidebarOpen.value = false
  const sidebar = document.getElementById('mobileSidebar')
  sidebar.classList.remove('show')
  document.body.classList.remove('sidebar-open')
  // 同时关闭分类下拉
  categoryDropdownOpen.value = false
}

// 切换移动端分类下拉
const toggleCategoryDropdown = () => {
  categoryDropdownOpen.value = !categoryDropdownOpen.value
}

// 切换用户下拉列表
const toggleUserDropdown = () => {
  userDropdownOpen.value = !userDropdownOpen.value
}

// 从API获取导航数据
const fetchNavData = async () => {
  try {
    const response = await axios.get('/api/pages/all', {
      params: {
        field: 'key,title',
        cache: false
      }
    })
    
    if (response.data && Array.isArray(response.data)) {
      navItems.value = response.data
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      navItems.value = response.data.data
    } else {
      navItems.value = []
    }
  } catch (error) {
    console.error('获取导航数据失败:', error)
  }
}

// 从API获取分类数据
const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/article-group/all', {
      params: {
        field: 'id,key,name',
        cache: false
      }
    })
    
    if (response.data && response.data.code === 200 && response.data.data && response.data.data.data) {
      categories.value = response.data.data.data
    } else if (response.data && Array.isArray(response.data)) {
      categories.value = response.data
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      categories.value = response.data.data
    } else {
      categories.value = []
    }
  } catch (error) {
    console.error('获取分类数据失败:', error)
    categories.value = []
  }
}

// 组件挂载时获取数据并初始化
onMounted(() => {
  fetchNavData()
  fetchCategories()
  initTheme()
  setupSystemThemeListener()
  
  // 监听窗口大小变化，自动关闭侧边栏
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) {
      closeSidebar()
    }
  })
  
  // 初始化主题获取
  method.getTheme()
  
  // 确保Bootstrap已加载后初始化下拉菜单
  if (window.bootstrap) {
    initDropdowns()
  } else {
    // 如果Bootstrap未加载，等待一下再尝试
    setTimeout(() => {
      if (window.bootstrap) {
        initDropdowns()
      }
    }, 100)
  }
})

// 当用户状态变化时重新初始化下拉菜单
watch(() => store.comm.login.user, () => {
  nextTick(() => {
    initDropdowns()
  })
})

onUpdated(() => {
  // 组件更新后检查是否需要重新初始化下拉菜单
  initDropdowns()
})

nextTick(async () => {
  await method.getTheme()
  initDropdowns()
})

// 监听当前路由 name 改变
watch(() => router.currentRoute.value.name, (val) => {
  const map = {
    'index-themes-list': 'themes',
    'index-articles-list': 'articles',
  }
  state.nav.name = map[val] || val
}, { immediate: true })

watch(() => state.drawer.show, (val) => {
  // 显示抽屉时禁止滚动
  document.querySelector('body').style.overflow = val ? 'hidden' : 'auto'
})

// 监听 auth 状态变化，自动显示对应的弹窗
watch(
  () => store.comm.auth,
  (newAuth) => {
    if (newAuth.login) {
      method.showLogin()
    } else if (newAuth.register) {
      method.showRegister()
    } else if (newAuth.reset) {
      method.showResetPassword()
    }
  },
  { deep: true }
)
</script>

<style scoped>
/* 基础样式 */
:deep(.nav-link.active) {
  color: #0077ff !important;
  font-weight: 500;
}

/* 移动端侧边栏样式 */
:deep(.sidebar) {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  z-index: 1050;
  background-color: var(--bs-body-bg);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  overflow-y: auto;
  border-right: 1px solid var(--bs-border-color);
}

:deep(.sidebar.show) {
  transform: translateX(0);
}

:deep(.sidebar-backdrop) {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
  backdrop-filter: blur(2px);
}

/* 防止页面滚动 */
:deep(.sidebar-open) {
  overflow: hidden;
}

/* 移动端按钮样式 */
:deep(.offcanvas-header) {
  padding: 1rem 1.5rem;
}

:deep(.offcanvas-body) {
  padding: 1.5rem;
}

/* 导航项样式优化 */
:deep(.navbar-nav .nav-item .nav-link) {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;
}

:deep(.navbar-nav .nav-item .nav-link:hover) {
  background-color: var(--bs-secondary-bg-subtle);
}

/* 适配不同主题 */
:deep(.dropdown-menu) {
  background-color: var(--bs-dropdown-bg);
}

:deep(.dropdown-item:hover) {
  background-color: var(--bs-dropdown-link-hover-bg);
}

/* 响应式调整 */
@media (max-width: 991.98px) {
  :deep(.navbar) {
    padding: 0.5rem 1rem;
  }
}

@media (min-width: 992px) {
  :deep(.sidebar) {
    display: none !important;
  }
  :deep(.sidebar-backdrop) {
    display: none !important;
  }
  /* PC端下拉强制展开修复 */
  :deep(.nav-item.dropdown) { position: relative; }
  :deep(.nav-item.dropdown .dropdown-menu) { z-index: 9999 !important; }
  :deep(.nav-item.dropdown:hover .dropdown-menu) { display: block !important; }
  :deep(.nav-item.dropdown .dropdown-toggle)[data-bs-toggle="dropdown"] { pointer-events: auto !important; }
  
  /* 用户下拉菜单强制显示 */
  :deep(.dropdown) { position: relative; }
  :deep(.dropdown .dropdown-menu) { z-index: 10000 !important; }
  :deep(.dropdown:hover .dropdown-menu) { display: block !important; }
  :deep(.dropdown .dropdown-toggle)[data-bs-toggle="dropdown"] { pointer-events: auto !important; }
  :deep(.dropdown-menu.show) { display: block !important; }
}
</style>