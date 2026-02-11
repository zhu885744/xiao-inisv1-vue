<template>
  <!-- 配置初始化组件 -->
  <ConfigInit />
  <!-- 全局导航栏 -->
  <i-nav ref="navRef"></i-nav>
  <!-- 主内容区 -->
  <div class="container">
    <div class="row">
      <div class="col">
        <router-view></router-view>
      </div>
      <!-- 全局侧边栏 -->
      <div class="col-3 d-none d-lg-block">
        <ISidebar @showLogin="handleShowLogin" @showRegister="handleShowRegister"></ISidebar>
      </div>
    </div>
  </div>
  <!-- 全局页脚 -->
  <i-footer></i-footer>

  <!-- 检查客户端页面更新 -->
  <upgrade-page></upgrade-page>
</template>

<script setup>
import { ref } from 'vue'
import upgradePage from '@/comps/upgrade/page.vue'
import iNav from '@/views/index/layout/nav.vue'
import ISidebar from '@/views/index/pages/sidebar.vue'
import iFooter from '@/views/index/layout/footer.vue'
import ConfigInit from '@/comps/config/init.vue'

const navRef = ref(null)

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
</script>