<template>
  <v-app>
    <!-- 全局导航栏 -->
    <i-nav></i-nav>
    <!-- 主内容区 -->
    <div class="container">
      <div class="row">
        <div class="col">
          <router-view></router-view>
        </div>
        <!-- 核心：加 d-none d-md-block，<768px隐藏，≥768px显示，保留col-3栅格 -->
        <div class="col-3 d-none d-lg-block">
          <ISidebar></ISidebar>
        </div>
      </div>
    </div>
    <!-- 全局页脚 -->
    <i-footer></i-footer>
  </v-app>
</template>

<script setup>
import iNav from '@/views/index/layout/nav.vue'
import ISidebar from '@/views/index/pages/sidebar.vue'
import iFooter from '@/views/index/layout/footer.vue'
</script>