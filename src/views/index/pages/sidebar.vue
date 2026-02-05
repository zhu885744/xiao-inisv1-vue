<template>
    <div class="card mt-2">
        <div class="card-header bg-light">
          <h6 class="mb-0 fw-semibold">个人信息</h6>
        </div>
        <div class="card-body">
            <div class="text-center mb-3">
                <img src="@/assets/img/avatar.png" alt="头像" class="rounded-circle border border-2 border-primary-subtle" width="80" height="80">
                <div class="fw-bold mt-2 text-secondary">HI！请登录</div>
                <hr class="my-3">
                <div class="d-flex gap-2 justify-content-center">
                  <button class="btn btn-primary btn-sm px-4">
                    登录
                  </button>
                  <button class="btn btn-outline-primary btn-sm px-4">
                    注册
                  </button>
                </div>
            </div>
        </div>
    </div>

    <!-- 热门文章（基于views浏览量排序）- 优化为更小卡片样式 -->
    <div class="card mt-2">
        <div class="card-header bg-light">
          <h6 class="mb-0 fw-semibold">热门文章</h6>
        </div>
        <div class="card-body p-0">
            <!-- 加载中 -->
            <div v-if="loading" class="text-center py-3">
                <div class="spinner-border text-primary" style="width: 0.8rem; height: 0.8rem;" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>

            <!-- 无数据 -->
            <div v-else-if="hotArticles.length === 0" class="text-center py-3 text-muted">
                暂无热门文章
            </div>

            <!-- 热门文章列表 - 更小卡片样式 -->
            <div v-else class="row g-1 p-2">
                <div 
                    class="col-12"
                    v-for="(article, index) in hotArticles" 
                    :key="article.id"
                >
                    <!-- 单篇文章小卡片 - 缩小尺寸 -->
                    <div 
                        class="card h-100 border rounded-2 overflow-hidden shadow-sm hover:shadow transition"
                        @click.prevent="goToArticle(article.id)"
                        style="cursor: pointer;"
                    >
                        <div class="card-body p-2">
                            <div class="d-flex align-items-center gap-1.5 mb-1">
                                <!-- 排名徽章：缩小尺寸 -->
                                <span 
                                    class="badge rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                    :class="{
                                        'bg-primary text-white': index < 3,
                                        'bg-secondary text-white': index >= 3
                                    }"
                                    style="width: 20px; height: 20px; font-size: 11px;"
                                >
                                    {{ index + 1 }}
                                </span>
                                <!-- 文章标题：不换行 + 超出省略 + 适配深色模式 -->
                                <h6 class="mb-0 fw-medium text-dark text-truncate hover:text-primary transition" 
                                    style="max-width: calc(100% - 30px);"
                                    :class="{'text-light': isDarkMode}"
                                >
                                    {{ article.title }}
                                </h6>
                            </div>
                            <!-- 文章统计信息：缩小字体和间距 -->
                            <div class="d-flex align-items-center justify-content-between text-muted fs-7">
                                <span>
                                  {{ article.views }} 阅读
                                </span>
                                <span v-if="article.createTime">
                                    {{ formatTime(article.createTime) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 最新评论 - 优化为小卡片样式 -->
    <div class="card mt-2">
        <div class="card-header bg-light">
          <h6 class="mb-0 fw-semibold">最新评论</h6>
        </div>
        <div class="card-body p-0">
            <!-- 无数据 -->
            <div v-if="!commentList.length" class="text-center py-3 text-muted">
                暂无评论
            </div>
            
            <!-- 评论列表 - 小卡片样式 -->
            <div v-else class="row g-1 p-2">
                <div 
                    class="col-12"
                    v-for="(comment, index) in commentList" 
                    :key="index"
                >
                    <!-- 单条评论小卡片 -->
                    <div 
                        class="card h-100 border rounded-2 overflow-hidden shadow-sm hover:shadow transition"
                        style="cursor: pointer;"
                        @click.prevent="goToArticle(comment.articleId)"
                    >
                        <div class="card-body p-2">
                            <div class="d-flex gap-1.5 mb-1">
                                <!-- 用户头像 -->
                                <img 
                                    src="@/assets/img/avatar.png" 
                                    alt="用户头像" 
                                    class="rounded-circle flex-shrink-0" 
                                    width="28" 
                                    height="28"
                                >
                                <!-- 评论内容区域 -->
                                <div class="flex-grow-1 overflow-hidden">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <span class="fw-medium text-dark fs-7" :class="{'text-light': isDarkMode}">
                                            {{ comment.author }}
                                        </span>
                                        <span class="text-muted fs-7">
                                            {{ comment.time }}
                                        </span>
                                    </div>
                                    <!-- 评论内容：多行省略 -->
                                    <p class="text-dark mb-1 fs-7 lh-sm text-truncate-2" 
                                       :class="{'text-light': isDarkMode}"
                                    >
                                        {{ comment.content }}
                                    </p>
                                    <!-- 关联文章标题 -->
                                    <a 
                                        href="#" 
                                        class="text-primary text-decoration-none fs-7 hover:text-primary transition"
                                        @click.prevent="goToArticle(comment.articleId)"
                                    >
                                        《{{ comment.articleTitle }}》
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 标签云（从文章数据中提取标签）- 缩小内边距和标签尺寸 -->
    <div class="card mt-2">
        <div class="card-header bg-light">
          <h6 class="mb-0 fw-semibold">标签云</h6>
        </div>
        <div class="card-body p-2">
            <div v-if="!tagList.length" class="text-center py-2 text-muted">暂无标签</div>
            <div v-else class="d-flex flex-wrap gap-1">
                <a 
                    href="#" 
                    class="badge bg-primary-subtle text-primary py-1 px-2 rounded-pill text-decoration-none hover:bg-primary hover:text-white transition"
                    v-for="tag in tagList" 
                    :key="tag.id"
                    :class="{
                        'bg-dark-subtle text-light': isDarkMode,
                        'hover:bg-primary hover:text-white': !isDarkMode,
                        'hover:bg-primary text-white': isDarkMode
                    }"
                >
                    {{ tag.name }}
                </a>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'

const router = useRouter()

// 定义响应式数据
const loading = ref(false);
const hotArticles = ref([]);
const tagList = ref([]);
const isDarkMode = ref(false);
// 新增评论列表数据
const commentList = ref([
    {
        articleId: 1,
        author: '张三',
        time: '2小时前',
        content: '教程写得非常好，通俗易懂，解决了我很久的疑惑！',
        articleTitle: 'Vue3 项目实战教程'
    },
    {
        articleId: 2,
        author: '李四',
        time: '5小时前',
        content: '请问这个布局在移动端适配有什么技巧吗？',
        articleTitle: 'Bootstrap5 布局技巧'
    },
    {
        articleId: 3,
        author: '王五',
        time: '昨天',
        content: '性能优化这部分内容太实用了，已经应用到项目中！',
        articleTitle: '前端性能优化指南'
    }
]);

// 检测系统/页面深色模式
const detectDarkMode = () => {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const pageDark = document.documentElement.classList.contains('dark');
    isDarkMode.value = systemDark || pageDark;
};

// 跳转文章详情
const goToArticle = (articleId) => {
    router.push(`/archives/${articleId}`);
};

// 格式化时间
const formatTime = (time) => {
    if (!time) return '';
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;
    const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 0) {
        const hourDiff = Math.floor(diff / (1000 * 60 * 60));
        return hourDiff > 0 ? `${hourDiff}小时前` : `${Math.floor(diff / (1000 * 60))}分钟前`;
    } else if (dayDiff === 1) {
        return '昨天';
    } else if (dayDiff < 7) {
        return `${dayDiff}天前`;
    } else {
        return date.toLocaleDateString();
    }
};

// 获取热门文章
const getHotArticles = async () => {
    try {
        loading.value = true;
        const response = await request.get('/api/article/all', {
            page: 1,
            limit: 5,
            order: 'views desc',
            cache: false
        });

        if (response.code === 200) {
            hotArticles.value = response.data.data;
            extractTagsFromArticles(response.data.data);
        }
    } catch (error) {
        console.error('获取热门文章失败：', error);
        hotArticles.value = [];
    } finally {
        loading.value = false;
    }
};

// 提取标签
const extractTagsFromArticles = (articles) => {
    const tagMap = new Map();
    articles.forEach(article => {
        if (article.result?.tags && article.result.tags.length) {
            article.result.tags.forEach(tag => {
                if (!tagMap.has(tag.id)) {
                    tagMap.set(tag.id, tag);
                }
            });
        }
    });
    tagList.value = Array.from(tagMap.values());
};

// 监听深色模式变化
watchEffect(() => {
    detectDarkMode();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectDarkMode);
});

// 组件挂载
onMounted(() => {
    detectDarkMode();
    getHotArticles();
});
</script>

<style scoped>
/* 基础样式 */
.hover\:text-primary:hover {
    color: #0d6efd !important;
}

.transition {
    transition: all 0.2s ease;
}

.fs-7 {
    font-size: 0.8rem !important;
}

.lh-sm {
    line-height: 1.2 !important;
}

/* 卡片阴影效果 */
.shadow-sm {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
}

.hover\:shadow:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

/* 单行省略 */
.text-truncate {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
}

/* 新增：两行省略（评论内容） */
.text-truncate-2 {
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
}

/* 深色模式适配 */
:deep(.dark .card) {
    background-color: #1f2937 !important;
    border-color: #374151 !important;
}

:deep(.dark .card-header.bg-light) {
    background-color: #111827 !important;
    color: #f9fafb !important;
}

:deep(.dark .text-muted) {
    color: #9ca3af !important;
}

/* 自定义间距 */
.gap-1\.5 {
    gap: 0.375rem !important;
}

/* 修复卡片内标题hover颜色 */
.card h6.hover\:text-primary:hover {
    color: #0d6efd !important;
}

/* 评论卡片链接hover效果 */
:deep(.card a.text-primary:hover) {
    color: #0a58ca !important;
}

:deep(.dark .card a.text-primary:hover) {
    color: #3b82f6 !important;
}
</style>