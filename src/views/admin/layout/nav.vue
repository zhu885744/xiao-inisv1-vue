<template>
  <!-- 顶部导航栏 -->
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid d-flex align-items-center">
      <!-- 移动端侧边栏触发按钮 -->
      <button 
        class="navbar-toggler d-lg-none me-3 border-0" 
        type="button" 
        @click="toggleSidebar"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- 网站标题：跳首页 -->
      <router-link class="navbar-brand flex-grow-1 text-center d-lg-block d-flex justify-content-start align-items-center" to="/admin">
        <img 
          v-if="store.comm.siteInfo?.avatar" 
          :src="store.comm.siteInfo.avatar" 
          alt="网站图标" 
          style="width: 45px;border-radius: 50%;"
        >
        <span v-else class="fw-bold">后台管理系统</span>
      </router-link>

      <!-- PC端导航内容 -->
      <div class="collapse navbar-collapse d-none d-lg-flex" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <!-- 首页 -->
          <li class="nav-item">
            <router-link class="nav-link" aria-current="page" to="/admin" active-class="active" exact-active-class="active">
              控制台
            </router-link>
          </li>

          <!-- 动态生成菜单项 -->
          <li v-for="menu in menuList" :key="menu.name" class="nav-item dropdown" ref="pcDropdownRef">
            <a class="nav-link dropdown-toggle" role="button" aria-expanded="false" data-bs-toggle="dropdown">
              {{ menu.label }}
            </a>
            <ul class="dropdown-menu">
              <li v-for="child in menu.children" :key="child.path" class="dropdown-item p-0">
                <router-link class="nav-link d-block w-100 h-100 py-2 px-4 text-decoration-none" :to="child.path">
                  {{ child.label }}
                </router-link>
              </li>
            </ul>
          </li>

          <!-- 返回前台 -->
          <li class="nav-item">
            <router-link class="nav-link" to="/" active-class="active" exact-active-class="active">
              返回前台
            </router-link>
          </li>
        </ul>
        
        <!-- 右侧功能区域 -->
        <div class="d-flex align-items-center">
          <!-- 深色/浅色模式切换按钮 -->
          <button 
            class="btn btn-outline-secondary me-2" 
            type="button" 
            @click="toggleDarkMode"
            :title="isDarkMode ? '切换到浅色模式' : '切换到深色模式'"
          >
            <i :class="darkModeIcon"></i>
          </button>
          
          <!-- 退出登录按钮 -->
          <button class="btn btn-outline-danger" @click="method.logout()">
            <i class="bi bi-box-arrow-right me-1"></i>退出登录
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- 移动端侧边栏 -->
  <div 
    class="offcanvas offcanvas-start" 
    tabindex="-1" 
    id="mobileSidebar"
    aria-labelledby="mobileSidebarLabel"
  >
    <div class="offcanvas-header border-bottom">
      <h5 class="offcanvas-title d-flex align-items-center" id="mobileSidebarLabel">
        <img 
          v-if="store.comm.siteInfo?.avatar" 
          :src="store.comm.siteInfo.avatar" 
          alt="网站图标" 
          class="nav-logo"
        >
        <span v-else class="fw-bold">后台管理系统</span>
      </h5>
      <button 
        type="button" 
        class="btn-close" 
        data-bs-dismiss="offcanvas" 
        aria-label="Close"
        @click="closeSidebar"
      ></button>
    </div>
    <div class="offcanvas-body d-flex flex-column">
      <!-- 移动端导航菜单 -->
      <ul class="navbar-nav flex-grow-1">
        <!-- 首页 -->
        <li class="nav-item mb-2">
          <router-link 
            class="nav-link" 
            to="/admin" 
            active-class="active" 
            exact-active-class="active"
            @click="closeSidebar"
          >
            首页
          </router-link>
        </li>

        <!-- 动态生成菜单项 -->
        <li v-for="menu in menuList" :key="menu.name" class="nav-item mb-2">
          <a 
            class="nav-link d-flex justify-content-between align-items-center" 
            href="javascript:;" 
            @click="toggleDropdown(menu.name)"
          >
            {{ menu.label }}
            <i :class="dropdownOpen[menu.name] ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
          </a>
          <!-- 子菜单 -->
          <ul class="navbar-nav ms-3 mt-2" v-show="dropdownOpen[menu.name]">
            <li v-for="child in menu.children" :key="child.path" class="nav-item mb-1">
              <router-link 
                class="nav-link" 
                :to="child.path"
                @click="closeSidebar"
              >
                {{ child.label }}
              </router-link>
            </li>
          </ul>
        </li>

        <!-- 返回前台 -->
        <li class="nav-item mb-2">
          <router-link 
            class="nav-link" 
            to="/" 
            active-class="active" 
            exact-active-class="active"
            @click="closeSidebar"
          >
            返回前台
          </router-link>
        </li>
      </ul>

      <!-- 移动端功能按钮组 -->
      <div class="mt-auto pt-3 border-top">
        <!-- 管理员功能 -->
        <div class="mb-4">
          <div class="text-center mb-3">
            <i class="bi bi-person-circle fs-4 text-success"></i>
            <div class="mt-1">{{ store.comm.login.user?.nickname || '管理员' }}</div>
          </div>
          <div class="d-grid grid-cols-2 gap-3">
            <button class="btn btn-outline-danger text-center" type="button" @click="method.logout()">
              <i class="bi bi-box-arrow-right me-1"></i>退出登录
            </button>
          </div>
        </div>
        
        <!-- 其他功能按钮 -->
        <div class="d-flex gap-2 mt-3">
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


</template>

<script setup>
import { ref, onMounted, computed, nextTick, reactive, watch, onUpdated } from 'vue'
import axios from '@/utils/request'
import utils from '@/utils/utils'
import Toast from '@/utils/toast'
import { list as getMenuList } from '@/utils/menu'
import cache from '@/utils/cache'
import { useRouter } from 'vue-router'
import { useCommStore } from '@/store/comm'
import { useConfigStore } from '@/store/config'



// 初始化router
const router = useRouter()

// 导航项数据
const sidebarOpen = ref(false)
const menuList = ref([])
const dropdownOpen = ref({})

// 初始化下拉菜单状态
const initDropdownState = () => {
  menuList.value.forEach(menu => {
    dropdownOpen.value[menu.name] = false
  })
}

// 存储
const store = {
  comm: useCommStore()
}

// 状态管理
const state = reactive({
  theme: 'white',
  drawer: {
    show: false,
    menu: true
  },
  nav: {
    name: 'admin',
    color: {
      active: 'rgb(var(--assist-color))',
      inactive: 'rgb(var(--vice-font-color))',
    }
  },
})

// 方法定义
const method = {
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
      // console.error('退出登录接口调用失败:', error)
      
      // 兜底清理前端状态（即使接口失败，也清理本地Token）
      utils.set.cookie(globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN', '', -1)
      store.comm.login.finish = false
      store.comm.login.user = null
      
      // 错误提示
      Toast.error('网络异常，已本地退出登录')
    } finally {
      // 无论成功失败，都关闭侧边栏
      closeSidebar()
      // 跳转到前台首页
      router.push('/')
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
    if (window.bootstrap) {
      const triggers = document.querySelectorAll('.dropdown-toggle')
      triggers.forEach(trigger => {
        try {
          // 确保每个下拉菜单只初始化一次
          if (!trigger._dropdown) {
            trigger._dropdown = new window.bootstrap.Dropdown(trigger)
          }
        } catch (e) {
          console.warn('下拉初始化失败:', e)
        }
      })
    }
  })
}

// 计算属性
const isDarkMode = computed(() => store.comm.isDarkMode)

const darkModeIcon = computed(() => {
  return isDarkMode.value ? 'bi bi-brightness-high-fill' : 'bi bi-brightness-high'
})

// 切换深色/浅色模式
const toggleDarkMode = () => {
  store.comm.toggleDarkMode()
}

// 初始化主题
const initTheme = () => {
  // 应用主题
  const htmlElement = document.documentElement
  htmlElement.setAttribute('data-bs-theme', isDarkMode.value ? 'dark' : 'light')
}

// 移除系统主题变化的监听，只支持手动切换
const setupSystemThemeListener = () => {
  // 不再监听系统主题变化
  return () => {}
}

// 侧边栏实例
let offcanvasInstance = null

// 初始化侧边栏
const initOffcanvas = () => {
  if (window.bootstrap && !offcanvasInstance) {
    const sidebar = document.getElementById('mobileSidebar')
    if (sidebar) {
      offcanvasInstance = new window.bootstrap.Offcanvas(sidebar, {
        backdrop: true,
        keyboard: true
      })
      
      // 监听关闭事件
      sidebar.addEventListener('hidden.bs.offcanvas', () => {
        sidebarOpen.value = false
        // 重置所有下拉菜单状态
        Object.keys(dropdownOpen.value).forEach(key => {
          dropdownOpen.value[key] = false
        })
      })
      
      // 监听显示事件
      sidebar.addEventListener('shown.bs.offcanvas', () => {
        sidebarOpen.value = true
      })
    }
  }
}

// 切换移动端侧边栏
const toggleSidebar = () => {
  if (!offcanvasInstance) {
    initOffcanvas()
  }
  
  if (sidebarOpen.value) {
    offcanvasInstance.hide()
  } else {
    offcanvasInstance.show()
  }
}

// 关闭侧边栏
const closeSidebar = () => {
  if (offcanvasInstance) {
    offcanvasInstance.hide()
  }
  sidebarOpen.value = false
  
  // 重置所有下拉菜单状态
  Object.keys(dropdownOpen.value).forEach(key => {
    dropdownOpen.value[key] = false
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

// 组件挂载时获取数据并初始化
onMounted(async () => {
  await fetchSiteInfo()
  await fetchMenuList()
  initTheme()
  setupSystemThemeListener()
  
  // 初始化 Bootstrap 组件
  if (window.bootstrap) {
    initDropdowns()
    initOffcanvas()
  } else {
    // 如果Bootstrap未加载，等待一下再尝试
    setTimeout(() => {
      if (window.bootstrap) {
        initDropdowns()
        initOffcanvas()
      }
    }, 100)
  }
  
  // 监听窗口大小变化，自动关闭侧边栏
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) {
      closeSidebar()
    }
  })
  
  // 初始化主题获取
  method.getTheme()
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
  state.nav.name = val
}, { immediate: true })

watch(() => state.drawer.show, (val) => {
  // 显示抽屉时禁止滚动
  document.querySelector('body').style.overflow = val ? 'hidden' : 'auto'
})
</script>

<style scoped>
/* 基础样式 */
:deep(.nav-link.active) {
  color: #0077ff !important;
  font-weight: 500;
}

/* 导航栏图标样式 */
.nav-logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

/* 响应式图标大小 */
@media (max-width: 768px) {
  .nav-logo {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 576px) {
  .nav-logo {
    width: 28px;
    height: 28px;
  }
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

/* 网格布局 */
:deep(.grid-cols-2) {
  grid-template-columns: repeat(2, 1fr);
}

:deep(.d-grid) {
  display: grid;
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
  
  /* 移动端标题居中 */
  :deep(.navbar-brand) {
    text-align: center !important;
    justify-content: center !important;
  }
}

@media (min-width: 992px) {
  /* PC端标题在左侧 */
  :deep(.navbar-brand) {
    text-align: left !important;
    justify-content: flex-start !important;
    flex-grow: 0 !important;
  }
}

@media (min-width: 992px) {
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