<template>
  <ConfigInit />
  
  <template v-if="$route.path === '/maintenance'">
    <router-view></router-view>
  </template>
  
  <template v-else-if="$route.path.startsWith('/admin')">
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
import ConfigInit from '@/comps/config/init.vue'
import iFloatButtons from '@/comps/custom/i-float-buttons.vue'
import socket from '@/utils/socket'
import { useCommStore } from '@/store/comm'
import request from '@/utils/request'

const navRef = ref(null)
const store = useCommStore()
const socketConnected = ref(false)
const customCodeInjected = ref(false)

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
    const response = await request.get('/api/config/one', { key: 'xiao_functions' })
    if (response.code === 200 && response.data) {
      const config = response.data.json || {}
      const customCodeData = config.custom_code || {}
      
      if (customCodeData.css) {
        const style = document.createElement('style')
        style.textContent = customCodeData.css
        document.head.appendChild(style)
      }
      
      if (customCodeData.header) {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = customCodeData.header
        while (tempDiv.firstChild) {
          document.head.appendChild(tempDiv.firstChild)
        }
      }
      
      if (customCodeData.js) {
        const script = document.createElement('script')
        script.textContent = customCodeData.js
        document.body.appendChild(script)
      }
      
      if (customCodeData.footer) {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = customCodeData.footer
        while (tempDiv.firstChild) {
          document.body.appendChild(tempDiv.firstChild)
        }
      }
      
      if (customCodeData.analytics) {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = customCodeData.analytics
        while (tempDiv.firstChild) {
          document.body.appendChild(tempDiv.firstChild)
        }
      }
    }
    customCodeInjected.value = true
  } catch (error) {
    console.error('注入自定义代码失败:', error)
  }
}

const setupSocket = () => {
  socket.on('open', () => {
    socketConnected.value = true
    console.log('WebSocket连接已建立')
  })
  
  socket.on('close', () => {
    socketConnected.value = false
    console.log('WebSocket连接已关闭')
  })
  
  socket.on('error', (error) => {
    console.error('WebSocket错误:', error)
  })
  
  socket.on('reconnect', (attempts) => {
    console.log(`WebSocket第${attempts}次重连成功`)
  })
  
  socket.connect()
}

onMounted(async () => {
  setupSocket()
  await injectCustomCode()
})

onUnmounted(() => {
  socket.destroy()
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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

.router-view-wrapper {
  width: 100%;
}
</style>