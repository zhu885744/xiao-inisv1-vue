<template>
  <template v-if="$route.path.startsWith('/admin')">
    <router-view key="$route.fullPath" v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </template>
  
  <template v-else>
    <i-nav ref="navRef"></i-nav>
    <div class="container">
      <template v-if="store.siteInfo?.sidebar_enabled !== false">
        <div class="row">
          <div class="col-lg-9">
            <router-view key="$route.fullPath" v-slot="{ Component }">
              <transition name="slide-fade" mode="out-in">
                <div class="router-view-wrapper">
                  <component :is="Component" />
                </div>
              </transition>
            </router-view>
          </div>
          <div class="col-lg-3 d-none d-lg-block">
            <ISidebar @showLogin="handleShowLogin" @showRegister="handleShowRegister"></ISidebar>
          </div>
        </div>
      </template>
      <template v-else>
        <router-view key="$route.fullPath" v-slot="{ Component }">
          <transition name="slide-fade" mode="out-in">
            <div class="router-view-wrapper">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </template>
    </div>
    <i-footer></i-footer>
    <i-float-buttons></i-float-buttons>
  </template>
  
  <upgrade-page></upgrade-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import upgradePage from '@/comps/upgrade/page.vue'
import iNav from '@/views/index/layout/nav.vue'
import ISidebar from '@/views/index/pages/sidebar.vue'
import iFooter from '@/views/index/layout/footer.vue'
import iFloatButtons from '@/comps/custom/i-float-buttons.vue'
import { socketManager as socket } from '@/utils/network'
import { useCommStore } from '@/store/comm'
import { request } from '@/utils/network'

const navRef = ref(null)
const store = useCommStore()
const customCodeInjected = ref(false)
const socketConnected = ref(false)

const handleShowLogin = () => {
  try {
    navRef.value?.method?.showLogin?.()
  } catch (error) {
    console.error('显示登录弹窗失败:', error)
  }
}

const handleShowRegister = () => {
  try {
    navRef.value?.method?.showRegister?.()
  } catch (error) {
    console.error('显示注册弹窗失败:', error)
  }
}

const injectCustomCode = async () => {
  if (customCodeInjected.value) return
  
  try {
    const cacheKey = 'custom_code_config'
    const cachedConfig = localStorage.getItem(cacheKey)
    let config = {}
    
    if (cachedConfig) {
      const parsed = JSON.parse(cachedConfig)
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        config = parsed.data
      }
    }
    
    if (!Object.keys(config).length) {
      const response = await request.get('/api/config/one', { key: 'xiao_functions' })
      if (response.code === 200 && response.data) {
        config = response.data.json || {}
        localStorage.setItem(cacheKey, JSON.stringify({
          data: config,
          timestamp: Date.now()
        }))
      }
    }
    
    const customCodeData = config.custom_code || {}
    
    if (customCodeData.css) {
      const style = document.createElement('style')
      style.textContent = customCodeData.css
      style.setAttribute('data-custom-css', 'true')
      document.head.appendChild(style)
    }
    
    if (customCodeData.header) {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = customCodeData.header
      while (tempDiv.firstChild) {
        document.head.appendChild(tempDiv.firstChild)
      }
    }
    
    if (customCodeData.js || customCodeData.footer || customCodeData.analytics) {
      const scripts = []
      if (customCodeData.js) scripts.push({ type: 'js', content: customCodeData.js })
      if (customCodeData.footer) scripts.push({ type: 'footer', content: customCodeData.footer })
      if (customCodeData.analytics) scripts.push({ type: 'analytics', content: customCodeData.analytics })
      
      setTimeout(() => {
        scripts.forEach(({ content }) => {
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = content
          while (tempDiv.firstChild) {
            document.body.appendChild(tempDiv.firstChild)
          }
        })
      }, 100)
    }
    
    customCodeInjected.value = true
  } catch (error) {
    console.error('注入自定义代码失败:', error)
  }
}

const setupSocket = () => {
  if (socketConnected.value) return
  
  const handleOpen = () => {
    console.log('WebSocket连接已建立')
    socketConnected.value = true
  }

  const handleClose = () => {
    console.log('WebSocket连接已关闭')
    socketConnected.value = false
  }

  const handleError = (error) => {
    console.error('WebSocket错误:', error)
    socketConnected.value = false
  }

  socket.on('open', handleOpen)
  socket.on('close', handleClose)
  socket.on('error', handleError)

  try {
    socket.connect()
  } catch (error) {
    console.error('WebSocket连接初始化失败:', error)
  }
}

const initAfterMount = async () => {
  await injectCustomCode()
  
  if (store.siteInfo?.enable_socket !== false) {
    setupSocket()
  }
}

onMounted(async () => {
  await initAfterMount()
})

onUnmounted(() => {
  socket.destroy()
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-fade-leave-active {
  transition: all 0.25s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.router-view-wrapper {
  width: 100%;
  min-height: calc(100vh - 200px);
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: none;
  }
}
</style>