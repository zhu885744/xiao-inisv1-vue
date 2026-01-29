<template>
  <v-app>
    <!-- 全局导航栏 -->
    <i-nav></i-nav>
    <!-- 主内容区 -->
    <router-view></router-view>
    <!-- 全局页脚 -->
    <i-footer></i-footer>
  </v-app>
</template>

<script setup>
import iNav from '@/views/index/layout/nav.vue'
import iFooter from '@/views/index/layout/footer.vue'
</script>