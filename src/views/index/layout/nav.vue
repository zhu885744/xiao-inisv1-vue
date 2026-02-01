<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container">
      <!-- 网站标题：跳首页 -->
      <router-link class="navbar-brand" to="/">朱某的生活印记</router-link>
      
      <!-- 移动端折叠按钮 -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- 导航核心内容 -->
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <!-- 首页：路由跳转 + 激活样式自动匹配 -->
          <li class="nav-item">
            <router-link class="nav-link" aria-current="page" to="/" active-class="active" exact-active-class="active">
              首页
            </router-link>
          </li>

          <!-- 分类下拉列表 -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="javascript:;" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              分类
            </a>
            <ul class="dropdown-menu">
              <!-- 优化后的分类项 -->
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '@/utils/request'

// 导航项数据
const navItems = ref([]);
// 分类数据
const categories = ref([]);
// 深色模式状态
const isDarkMode = ref(false);

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

// 监听系统主题变化（可选）
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

// 从API获取导航数据
const fetchNavData = async () => {
  try {
    const response = await axios.get('/api/pages/all', {
      params: {
        field: 'key,title', // 只获取key和title字段
        cache: false
      }
    });
    
    // 检查API返回的数据结构
    if (response.data && Array.isArray(response.data)) {
      navItems.value = response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // 处理常见的API响应格式：{ data: [...] }
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
    
    // 检查API返回的数据结构
    if (response.data && response.data.code === 200 && response.data.data && response.data.data.data) {
      // 处理API返回的数据结构：{ code: 200, data: { data: [...] } }
      categories.value = response.data.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      categories.value = response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // 处理常见的API响应格式：{ data: [...] }
      categories.value = response.data.data;
    } else {
      categories.value = [];
    }
  } catch (error) {
    console.error('获取分类数据失败:', error);
    categories.value = [];
  }
};

// 组件挂载时获取数据并初始化主题
onMounted(() => {
  fetchNavData();
  fetchCategories();
  initTheme();
  setupSystemThemeListener();
});
</script>

<style scoped>
/* 自定义激活样式 */
:deep(.nav-link.active) {
  color: #0077ff !important;
  font-weight: 500;
}

/* 主题切换按钮悬停效果 */
.btn-outline-secondary:hover {
  background-color: var(--bs-secondary-bg-subtle);
  border-color: var(--bs-secondary-border-subtle);
}

/* 确保下拉菜单在不同主题下都有正确的样式 */
.dropdown-menu {
  background-color: var(--bs-dropdown-bg);
}

.dropdown-item:hover {
  background-color: var(--bs-dropdown-link-hover-bg);
}
</style>