<template>
    <div class="admin-container">
        <!-- 导航栏 -->
        <admin-nav></admin-nav>
        
        <!-- 主内容区 -->
        <main class="container-fluid">
            <router-view></router-view>
        </main>
        
        <!-- 页脚 -->
        <admin-footer></admin-footer>
    </div>
</template>

<script setup>
import AdminNav from './nav.vue'
import AdminFooter from './footer.vue'
</script>