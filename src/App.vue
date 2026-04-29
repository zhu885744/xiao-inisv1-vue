<template>
  <!-- 配置初始化组件 -->
  <ConfigInit />
  
  <!-- 维护页面：单独显示，不使用任何布局 -->
  <template v-if="$route.path === '/maintenance'">
    <router-view></router-view>
  </template>
  
  <!-- 基于路由的布局切换 -->
  <template v-else-if="$route.path.startsWith('/admin')">
    <transition name="fade" mode="out-in">
      <router-view key="$route.fullPath"></router-view>
    </transition>
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
            <transition name="slide-fade" mode="out-in">
              <router-view key="$route.fullPath"></router-view>
            </transition>
          </div>
          <!-- 全局侧边栏 -->
          <div class="col-lg-3 d-none d-lg-block">
            <ISidebar @showLogin="handleShowLogin" @showRegister="handleShowRegister"></ISidebar>
          </div>
        </div>
      </template>
      <template v-else>
        <transition name="slide-fade" mode="out-in">
          <router-view key="$route.fullPath"></router-view>
        </transition>
      </template>
    </div>
    <!-- 全局页脚 -->
    <i-footer></i-footer>

    <!-- 悬浮按钮组件 -->
    <i-float-buttons></i-float-buttons>
  </template>

  <!-- 检查客户端页面更新 -->
  <upgrade-page></upgrade-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import upgradePage from '@/comps/upgrade/page.vue'
import iNav from '@/views/index/layout/nav.vue'
import ISidebar from '@/views/index/pages/sidebar.vue'
import iFooter from '@/views/index/layout/footer.vue'
import ConfigInit from '@/comps/config/init.vue'
import iFloatButtons from '@/comps/custom/i-float-buttons.vue'
import socket from '@/utils/socket'
import { useCommStore } from '@/store/comm'
import request from '@/utils/request'

const navRef = ref(null)
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
  // 连接WebSocket
  socket.on('open', handleSocketOpen)
  socket.on('close', handleSocketClose)
  socket.on('error', handleSocketError)
  socket.connect()
  
  // 注入自定义代码
  await injectCustomCode()
})

onUnmounted(() => {
  // 销毁WebSocket实例
  socket.destroy()
})
</script>

<style>
/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滑动淡入动画 */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>