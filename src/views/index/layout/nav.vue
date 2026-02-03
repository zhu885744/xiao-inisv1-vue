<template>
  <!-- 顶部导航栏 -->
  <nav class="navbar navbar-expand-lg bg-body-tertiary ">
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
        <div role="group" aria-label="操作按钮组">
          <button class="btn btn-outline-secondary ms-2" type="submit"><i class="bi bi-search"></i></button>
          <!-- 深色/浅色模式切换按钮 -->
          <button 
            class="btn btn-outline-secondary ms-2" 
            type="button" 
            @click="toggleDarkMode"
            :title="isDarkMode ? '切换到浅色模式' : '切换到深色模式'"
          >
            <i :class="darkModeIcon"></i>
          </button>
          <button class="btn btn-outline-secondary ms-2" type="submit"><i class="bi bi-person-circle"></i></button>
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
      <div class="mt-auto pt-3 border-top d-flex gap-2">
        <button class="btn btn-outline-secondary flex-grow-1" type="button"><i class="bi bi-search me-1"></i>搜索</button>
        <button 
          class="btn btn-outline-secondary flex-grow-1" 
          type="button" 
          @click="toggleDarkMode"
        >
          <i :class="[darkModeIcon, 'me-1']"></i>{{ isDarkMode ? '浅色' : '深色' }}
        </button>
        <button class="btn btn-outline-secondary flex-grow-1" type="button"><i class="bi bi-person-circle me-1"></i>我的</button>
      </div>
    </div>
  </div>

  <!-- 侧边栏遮罩层 -->
  <div 
    v-if="sidebarOpen"
    class="sidebar-backdrop"
    @click="closeSidebar"
  ></div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'; // ✅ 新增nextTick
import axios from '@/utils/request'

// 导航项数据
const navItems = ref([]);
// 分类数据
const categories = ref([]);
// 深色模式状态
const isDarkMode = ref(false);
// 侧边栏状态
const sidebarOpen = ref(false);
// 分类下拉菜单状态（移动端）
const categoryDropdownOpen = ref(false);
// PC端下拉ref，用于手动初始化Bootstrap实例
const pcDropdownRef = ref(null);

// 计算图标类名
const darkModeIcon = computed(() => {
  return isDarkMode.value ? 'bi bi-brightness-high-fill' : 'bi bi-brightness-high';
});

// 切换深色/浅色模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  
  // 更新HTML的data-bs-theme属性
  const htmlElement = document.documentElement;
  htmlElement.setAttribute('data-bs-theme', isDarkMode.value ? 'dark' : 'light');
  
  // 保存用户偏好到localStorage
  localStorage.setItem('preferred-theme', isDarkMode.value ? 'dark' : 'light');
  
  console.log(`已切换到${isDarkMode.value ? '深色' : '浅色'}模式`);
};

// 初始化主题
const initTheme = () => {
  // 从localStorage获取用户偏好
  const savedTheme = localStorage.getItem('preferred-theme');
  
  if (savedTheme) {
    // 使用用户保存的偏好
    isDarkMode.value = savedTheme === 'dark';
  } else {
    // 如果没有保存的偏好，使用系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDarkMode.value = prefersDark;
  }
  
  // 应用主题
  const htmlElement = document.documentElement;
  htmlElement.setAttribute('data-bs-theme', isDarkMode.value ? 'dark' : 'light');
  
  console.log(`初始化${isDarkMode.value ? '深色' : '浅色'}模式`);
};

// 监听系统主题变化
const setupSystemThemeListener = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleThemeChange = (e) => {
    // 只有当用户没有保存偏好时才跟随系统变化
    if (!localStorage.getItem('preferred-theme')) {
      isDarkMode.value = e.matches;
      const htmlElement = document.documentElement;
      htmlElement.setAttribute('data-bs-theme', e.matches ? 'dark' : 'light');
      console.log(`系统主题已切换，跟随系统到${e.matches ? '深色' : '浅色'}模式`);
    }
  };
  
  // 添加监听
  mediaQuery.addEventListener('change', handleThemeChange);
  
  // 返回清理函数
  return () => mediaQuery.removeEventListener('change', handleThemeChange);
};

// 切换移动端侧边栏
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
  const sidebar = document.getElementById('mobileSidebar');
  if (sidebarOpen.value) {
    sidebar.classList.add('show');
    document.body.classList.add('sidebar-open');
  } else {
    sidebar.classList.remove('show');
    document.body.classList.remove('sidebar-open');
  }
};

// 关闭侧边栏
const closeSidebar = () => {
  sidebarOpen.value = false;
  const sidebar = document.getElementById('mobileSidebar');
  sidebar.classList.remove('show');
  document.body.classList.remove('sidebar-open');
  // 同时关闭分类下拉
  categoryDropdownOpen.value = false;
};

// 切换移动端分类下拉
const toggleCategoryDropdown = () => {
  categoryDropdownOpen.value = !categoryDropdownOpen.value;
};

// 初始化PC端Bootstrap下拉组件（核心：用nextTick保证DOM加载完成）
const initPcDropdown = async () => {
  await nextTick(); // 等待Vue DOM更新完成
  if (pcDropdownRef.value && window.bootstrap) {
    const trigger = pcDropdownRef.value.querySelector('.dropdown-toggle');
    // 手动创建下拉实例，强制激活触发逻辑
    new window.bootstrap.Dropdown(trigger);
    console.log('✅ PC端下拉组件手动初始化成功');
  }
};

// 从API获取导航数据
const fetchNavData = async () => {
  try {
    const response = await axios.get('/api/pages/all', {
      params: {
        field: 'key,title', // 只获取key和title字段
        cache: false
      }
    });
    
    if (response.data && Array.isArray(response.data)) {
      navItems.value = response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      navItems.value = response.data.data;
    } else {
      navItems.value = [];
    }
  } catch (error) {
    console.error('获取导航数据失败:', error);
  }
};

// 从API获取分类数据
const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/article-group/all', {
      params: {
        field: 'id,key,name', // 获取必要的字段
        cache: false
      }
    });
    
    if (response.data && response.data.code === 200 && response.data.data && response.data.data.data) {
      categories.value = response.data.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      categories.value = response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      categories.value = response.data.data;
    } else {
      categories.value = [];
    }
  } catch (error) {
    console.error('获取分类数据失败:', error);
    categories.value = [];
  }
};

// 组件挂载时获取数据并初始化
onMounted(() => {
  fetchNavData();
  fetchCategories();
  initTheme();
  setupSystemThemeListener();
  initPcDropdown(); // 新增：调用PC端下拉初始化方法 ✅
  
  // 监听窗口大小变化，自动关闭侧边栏
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) {
      closeSidebar();
    }
  });
});
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
  /* ✅ 核心新增：PC端下拉强制展开修复（hover+点击双生效，最高层级防遮挡） */
  :deep(.nav-item.dropdown) { position: relative; }
  :deep(.nav-item.dropdown .dropdown-menu) { z-index: 9999 !important; }
  :deep(.nav-item.dropdown:hover .dropdown-menu) { display: block !important; }
  :deep(.nav-item.dropdown .dropdown-toggle)[data-bs-toggle="dropdown"] { pointer-events: auto !important; }
}
</style>