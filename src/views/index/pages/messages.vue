<template>
  <div class="mt-2">
    <!-- 页面标题 -->
    <div class="card shadow-sm mt-2">
      <div class="card-body py-3">
        <h5 class="card-title mb-0 d-flex align-items-center gap-2">
          <i class="bi bi-bell-fill text-primary"></i>
          通知中心
        </h5>
      </div>
    </div>

    <!-- 通知内容 -->
    <div class="card shadow-sm rounded-3 mt-2">
      <div class="card-body text-center py-5">
        <i class="bi bi-bell-slash text-muted fs-3 d-block mb-4"></i>
        <h5 class="text-muted mb-0">功能开发当中，敬请期待！</h5>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePageTitle } from '@/utils/usePageTitle'

// 设置页面标题
const { setDynamicTitle } = usePageTitle()
setDynamicTitle('通知中心')
</script>