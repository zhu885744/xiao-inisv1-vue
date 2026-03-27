<!-- 搜索页面 -->
<template>
  <div class="card mt-2">
    <div class="card-header">
      <span class="card-title">搜索</span>
    </div>
    <div class="card-body">
    <!-- 搜索头部 -->
    <div class="search-header">
      <div class="search-header-content">
        <!-- 搜索范围选择 -->
        <div class="mt-2">
          <div class="btn-group w-100" role="group" aria-label="搜索范围">
            <button
              type="button"
              class="btn" 
              :class="searchScope === 'all' ? 'btn-primary' : 'btn-outline-primary'"
              @click="searchScope = 'all'"
            >
              <i class="bi bi-search"></i> 全部
            </button>
            <button
              type="button"
              class="btn" 
              :class="searchScope === 'article' ? 'btn-primary' : 'btn-outline-primary'"
              @click="searchScope = 'article'"
            >
              <i class="bi bi-file-earmark-text"></i> 文章
            </button>
            <button
              type="button"
              class="btn" 
              :class="searchScope === 'page' ? 'btn-primary' : 'btn-outline-primary'"
              @click="searchScope = 'page'"
            >
              <i class="bi bi-file-earmark"></i> 页面
            </button>
            <button
              type="button"
              class="btn" 
              :class="searchScope === 'tag' ? 'btn-primary' : 'btn-outline-primary'"
              @click="searchScope = 'tag'"
            >
              <i class="bi bi-tag"></i> 标签
            </button>
          </div>
        </div>
        <!-- 搜索输入框 -->
        <div class="input-group mt-2">
          <input
            ref="searchInput"
            type="text"
            v-model="searchQuery"
            class="form-control form-control-lg"
            :placeholder="getSearchPlaceholder()"
            @input="handleInput"
            @keyup.enter="performSearch"
          >
          <button
            class="btn btn-primary"
            type="button"
            @click="performSearch"
            :disabled="loading"
          >
            <i class="bi" :class="loading ? 'bi-arrow-clockwise spin' : 'bi-search'"></i>
            <span class="ms-2">搜索</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 搜索内容区域 -->
    <div class="search-content">
        <!-- 搜索历史 -->
        <div v-if="!loading && searchQuery === '' && searchHistory.length > 0" class="mt-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="text-muted">
              <i class="bi bi-clock-history me-1"></i>搜索历史
            </h6>
            <button @click="clearSearchHistory" class="btn btn-sm btn-outline-secondary">
              清除历史
            </button>
          </div>
          <div class="card">
            <div class="list-group list-group-flush">
              <div
                v-for="(item, index) in searchHistory"
                :key="index"
                class="list-group-item d-flex justify-content-between align-items-center"
                @click="useSearchHistory(item)"
                style="cursor: pointer;"
              >
                <span>{{ item }}</span>
                <button @click.stop="searchHistory.splice(index, 1); localStorage.setItem('search-history', JSON.stringify(searchHistory))" class="btn btn-sm text-muted">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 搜索结果 -->
        <div v-else-if="!loading && searchResults.length > 0" class="mt-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="text-muted">
              <i class="bi bi-search me-1"></i>搜索结果 ({{ searchResults.length }})
            </h6>
          </div>
          <div class="result-list">
            <div
              v-for="result in searchResults"
              :key="result.id || result.key"
              @click="navigateToResult(result)"
              class="result-item mb-3"
              :class="`result-${result.type}`"
            >
              <div class="card h-100 transition-all duration-300 hover:shadow-sm">
                <div class="card-body">
                  <div class="d-flex align-items-start">
                    <div class="result-icon-container me-3">
                      <i :class="[getResultIcon(result.type), 'result-icon']"></i>
                    </div>
                    <div class="flex-grow-1">
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title mb-0 font-medium">{{ result.title || result.name }}</h5>
                        <span class="result-type-badge" :class="`badge-${result.type}`">
                          {{ getResultTypeName(result.type) }}
                        </span>
                      </div>
                      <p v-if="result.abstract" class="card-text text-muted line-clamp-2 mb-2">{{ result.abstract }}</p>
                      <div v-if="result.create_time" class="text-xs text-gray-400">
                        {{ formatDate(result.create_time) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 无结果 -->
        <div v-else-if="!loading && searchQuery !== '' && searchResults.length === 0" class="text-center py-12">
          <div class="mb-4">
            <i class="bi bi-search text-5xl text-muted"></i>
          </div>
          <p class="text-muted">没有找到与 "{{ searchQuery }}" 相关的结果</p>
        </div>

        <!-- 加载中 -->
        <div v-else-if="loading" class="text-center py-12">
          <div class="spinner-border text-primary mb-4" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-muted">搜索中...</p>
        </div>

        <!-- 初始状态 -->
        <div v-else-if="!loading && searchQuery === '' && searchHistory.length === 0" class="text-center py-12">
          <div class="mb-4">
            <i class="bi bi-search text-5xl text-muted"></i>
          </div>
          <p class="text-muted">请输入关键词开始搜索</p>
        </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from '@/utils/request'
import Toast from '@/utils/toast'
import { usePageTitle } from '@/utils/usePageTitle'

// Router
const router = useRouter()
const route = useRoute()

// 使用页面标题管理
const { setDynamicTitle } = usePageTitle();
setDynamicTitle('搜索');

// 响应式数据
const searchQuery = ref('')
const loading = ref(false)
const searchResults = ref([])
const searchHistory = ref([])
const debounceTimer = ref(null)
const searchInput = ref(null)
const searchScope = ref('all') // 搜索范围：all, article, page, tag

// 初始化
onMounted(() => {
  loadSearchHistory()
  // 从路由参数中获取搜索关键词
  if (route.query.q) {
    searchQuery.value = route.query.q
    performSearch()
  }
  // 聚焦输入框
  setTimeout(() => {
    if (searchInput.value) {
      searchInput.value.focus()
    }
  }, 100)
})

// 加载搜索历史
const loadSearchHistory = () => {
  const history = localStorage.getItem('search-history')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

// 保存搜索历史
const saveSearchHistory = (query) => {
  if (!query) return
  
  // 移除重复项
  searchHistory.value = searchHistory.value.filter(item => item !== query)
  
  // 添加到开头
  searchHistory.value.unshift(query)
  
  // 限制历史记录数量
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }
  
  // 保存到 localStorage
  localStorage.setItem('search-history', JSON.stringify(searchHistory.value))
}

// 清除搜索历史
const clearSearchHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('search-history')
}

// 使用搜索历史
const useSearchHistory = (query) => {
  searchQuery.value = query
  performSearch()
}

// 输入处理（防抖）
const handleInput = () => {
  clearTimeout(debounceTimer.value)
  debounceTimer.value = setTimeout(() => {
    if (searchQuery.value.trim()) {
      performSearch()
    } else {
      searchResults.value = []
    }
  }, 300)
}

// 执行搜索
const performSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) return
  
  loading.value = true
  searchResults.value = []
  
  try {
    let results = []
    
    // 根据搜索范围执行不同的搜索
    switch (searchScope.value) {
      case 'article':
        // 只搜索文章
        results = await searchArticles(query)
        break
      case 'page':
        // 只搜索页面
        results = await searchPages(query)
        break
      case 'tag':
        // 只搜索标签
        results = await searchTags(query)
        break
      default:
        // 全局搜索：搜索文章、页面和标签
        const [articleResults, pageResults, tagResults] = await Promise.all([
          searchArticles(query),
          searchPages(query),
          searchTags(query)
        ])
        
        // 合并并优化搜索结果
        const optimizedResults = []
        const seenIds = new Set() // 用于去重
        
        // 1. 首先添加文章结果，按相关性排序
        if (articleResults.length > 0) {
          // 按创建时间降序排序
          const sortedArticles = articleResults.sort((a, b) => {
            return new Date(b.create_time || 0) - new Date(a.create_time || 0)
          })
          
          // 去重并添加文章结果
          sortedArticles.forEach(article => {
            if (!seenIds.has(article.id)) {
              seenIds.add(article.id)
              optimizedResults.push(article)
            }
          })
        }
        
        // 2. 然后添加页面结果
        if (pageResults.length > 0) {
          // 按创建时间降序排序
          const sortedPages = pageResults.sort((a, b) => {
            return new Date(b.create_time || 0) - new Date(a.create_time || 0)
          })
          
          // 去重并添加页面结果
          sortedPages.forEach(page => {
            if (!seenIds.has(page.id)) {
              seenIds.add(page.id)
              optimizedResults.push(page)
            }
          })
        }
        
        // 3. 最后添加标签结果，限制数量
        if (tagResults.length > 0) {
          // 限制标签数量
          const relevantTags = tagResults.slice(0, 3)
          
          // 去重并添加标签结果
          relevantTags.forEach(tag => {
            if (!seenIds.has(tag.id)) {
              seenIds.add(tag.id)
              optimizedResults.push(tag)
            }
          })
        }
        
        results = optimizedResults
        break
    }
    
    // 设置搜索结果
    searchResults.value = results
    
    // 保存搜索历史
    saveSearchHistory(query)
  } catch (error) {
    console.error('搜索失败:', error)
    Toast.error('搜索失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 搜索文章
const searchArticles = async (keyword) => {
  try {
    // 构建搜索URL
    const url = `/api/search/article?keyword=${encodeURIComponent(keyword)}&page=1&limit=50`
    const response = await axios.get(url)
    
    if (response.code === 200 && response.data) {
      // 检查实际的数据结构
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map(item => ({
          ...item,
          type: 'article'
        }))
      } else if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
        return response.data.data.data.map(item => ({
          ...item,
          type: 'article'
        }))
      }
    }
    return []
  } catch (error) {
    console.error('搜索文章失败:', error)
    return []
  }
}

// 搜索页面
const searchPages = async (keyword) => {
  try {
    // 构建搜索URL
    const url = `/api/search/pages?keyword=${encodeURIComponent(keyword)}&page=1&limit=50`
    const response = await axios.get(url)
    
    if (response.code === 200 && response.data) {
      // 检查实际的数据结构
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map(item => ({
          ...item,
          type: 'page'
        }))
      } else if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
        return response.data.data.data.map(item => ({
          ...item,
          type: 'page'
        }))
      }
    }
    return []
  } catch (error) {
    console.error('搜索页面失败:', error)
    return []
  }
}

// 搜索标签
const searchTags = async (keyword) => {
  try {
    // 构建搜索URL
    const url = `/api/search/tags?keyword=${encodeURIComponent(keyword)}&page=1&limit=50`
    const response = await axios.get(url)
    
    if (response.code === 200 && response.data) {
      // 检查实际的数据结构
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map(item => ({
          ...item,
          type: 'tag'
        }))
      } else if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
        return response.data.data.data.map(item => ({
          ...item,
          type: 'tag'
        }))
      }
    }
    return []
  } catch (error) {
    console.error('搜索标签失败:', error)
    return []
  }
}

// 获取结果图标
const getResultIcon = (type) => {
  switch (type) {
    case 'article':
      return 'bi bi-file-earmark-text'
    case 'page':
      return 'bi bi-file-earmark'
    case 'tag':
      return 'bi bi-tag'
    default:
      return 'bi bi-search'
  }
}

// 获取结果类型的中文名称
const getResultTypeName = (type) => {
  switch (type) {
    case 'article':
      return '文章'
    case 'page':
      return '页面'
    case 'tag':
      return '标签'
    default:
      return '未知'
  }
}

// 获取搜索占位符
const getSearchPlaceholder = () => {
  switch (searchScope.value) {
    case 'article':
      return '搜索文章...'
    case 'page':
      return '搜索页面...'
    case 'tag':
      return '搜索标签...'
    default:
      return '搜索文章、页面或标签...'
  }
}

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  
  // 处理秒级时间戳（转换为毫秒级）
  const timestampMs = typeof timestamp === 'number' ? timestamp * 1000 : timestamp
  const date = new Date(timestampMs)
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) return ''
  
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 导航到结果
const navigateToResult = (result) => {
  switch (result.type) {
    case 'article':
      if (result.id) {
        router.push(`/archives/${result.id}`)
      }
      break
    case 'page':
      if (result.key) {
        router.push(`/${result.key}`)
      } else {
        Toast.error('页面路径无效，无法跳转')
      }
      break
    case 'tag':
      // 假设标签页面的路由是 /tag/:id
      if (result.id) {
        router.push(`/tag/${result.id}`)
      }
      break
    default:
      break
  }
}

// 清理
const cleanup = () => {
  clearTimeout(debounceTimer.value)
}

// 生命周期钩子
onUnmounted(() => {
  cleanup()
})
</script>