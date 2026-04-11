<template>
  <!-- 配置初始化组件 -->
  <ConfigInit />
  
  <!-- 基于路由的布局切换 -->
  <template v-if="$route.path.startsWith('/admin')">
    <!-- 使用路由视图，让 admin 路由的父组件 (base.vue) 处理布局 -->
    <router-view></router-view>
  </template>
  <template v-else>
    <!-- Index布局 -->
    <!-- 全局导航栏 -->
    <i-nav ref="navRef"></i-nav>
    <!-- 主内容区 -->
    <div class="container">
      <template v-if="store.siteInfo?.sidebar_enabled !== false">
        <div class="row">
          <div class="col-lg-9">
            <router-view></router-view>
          </div>
          <!-- 全局侧边栏 -->
          <div class="col-lg-3 d-none d-lg-block">
            <ISidebar @showLogin="handleShowLogin" @showRegister="handleShowRegister"></ISidebar>
          </div>
        </div>
      </template>
      <template v-else>
        <router-view></router-view>
      </template>
    </div>
    <!-- 全局页脚 -->
    <i-footer></i-footer>
    <!-- 全局公告弹窗 -->
    <i-notice></i-notice>
  </template>

  <!-- 检查客户端页面更新 -->
  <upgrade-page></upgrade-page>
  
  <!-- 返回顶部按钮 -->
  <button 
    class="btn shadow-lg back-to-top" 
    id="backToTop" 
    @click="scrollToTop"
    :class="{ 'show': showBackToTop }"
    title="返回顶部"
    style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--bs-secondary), var(--bs-dark)); border: none; color: #fff; font-size: 1.5rem;"
  >
    <i class="bi bi-arrow-up"></i>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import upgradePage from '@/comps/upgrade/page.vue'
import iNav from '@/views/index/layout/nav.vue'
import ISidebar from '@/views/index/pages/sidebar.vue'
import iFooter from '@/views/index/layout/footer.vue'
import ConfigInit from '@/comps/config/init.vue'
import iNotice from '@/comps/custom/i-notice.vue'
import socket from '@/utils/socket'
import { useCommStore } from '@/store/comm'
import request from '@/utils/request'

const navRef = ref(null)
const showBackToTop = ref(false)
const store = useCommStore()

const handleShowLogin = () => {
  if (navRef.value && navRef.value.method && navRef.value.method.showLogin) {
    navRef.value.method.showLogin()
  }
}

const handleShowRegister = () => {
  if (navRef.value && navRef.value.method && navRef.value.method.showRegister) {
    navRef.value.method.showRegister()
  }
}

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 注入自定义代码
const injectCustomCode = async () => {
  try {
    // 从后端获取自定义代码配置
    const response = await request.get('/api/config/one', { key: 'xiao_functions' })
    if (response.code === 200 && response.data) {
      const config = response.data.json || {}
      const customCodeData = config.custom_code || {}
      
      // 注入CSS
      if (customCodeData.css) {
        const style = document.createElement('style')
        style.textContent = customCodeData.css
        document.head.appendChild(style)
      }
      
      // 注入头部HTML
      if (customCodeData.header) {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = customCodeData.header
        while (tempDiv.firstChild) {
          document.head.appendChild(tempDiv.firstChild)
        }
      }
      
      // 注入JavaScript
      if (customCodeData.js) {
        const script = document.createElement('script')
        script.textContent = customCodeData.js
        document.body.appendChild(script)
      }
      
      // 注入底部HTML
      if (customCodeData.footer) {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = customCodeData.footer
        while (tempDiv.firstChild) {
          document.body.appendChild(tempDiv.firstChild)
        }
      }
      
      // 注入网站统计代码
      if (customCodeData.analytics) {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = customCodeData.analytics
        while (tempDiv.firstChild) {
          document.body.appendChild(tempDiv.firstChild)
        }
      }
    }
  } catch (error) {
    console.error('注入自定义代码失败:', error)
  }
}

// 监听滚动事件
const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

// WebSocket事件处理
const handleSocketOpen = () => {
  console.log('WebSocket连接已建立');
}

const handleSocketClose = () => {
  console.log('WebSocket连接已关闭');
}

const handleSocketError = (error) => {
  console.error('WebSocket错误:', error);
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
  
  // 连接WebSocket
  socket.on('open', handleSocketOpen)
  socket.on('close', handleSocketClose)
  socket.on('error', handleSocketError)
  socket.connect()
  
  // 注入自定义代码
  await injectCustomCode()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  
  // 销毁WebSocket实例
  socket.destroy()
})
</script>

<style>
/* 返回顶部按钮样式 */
.back-to-top {
  position: fixed;
  top: 50%;
  right: 10px;
  transform: translateY(-50%) translateY(-30px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 999;
}

.back-to-top.show {
  opacity: 1;
  visibility: visible;
}

.back-to-top:hover {
  transform: translateY(-50%) translateY(-33px);
}

.back-to-top:active {
  transform: translateY(-50%) translateY(-30px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .back-to-top {
    right: 20px;
  }
  
  .back-to-top {
    width: 40px !important;
    height: 40px !important;
    font-size: 1rem !important;
  }
}
</style>