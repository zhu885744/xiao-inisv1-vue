<template>
  <div class="theme-upgrade-page">
    <div class="card mt-2 shadow-sm">
      <!-- 页面头部 -->
      <div class="card-header border-bottom">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0 d-flex align-items-center gap-2">
            <i class="bi bi-arrow-down-circle text-primary"></i>
            主题版本更新
          </h5>
          <button 
            @click="checkForUpdates" 
            class="btn btn-sm btn-outline-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            {{ loading ? '检查中...' : '检查更新' }}
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading && !currentVersion" class="card-body text-center py-12">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-3 text-body-secondary">正在检查版本信息...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="card-body">
        <div class="alert alert-danger d-flex align-items-center" role="alert">
          <i class="bi bi-exclamation-circle flex-shrink-0 me-2"></i>
          <div class="flex-grow-1">
            {{ error }}
            <button 
              @click="checkForUpdates" 
              class="btn btn-sm btn-outline-danger mt-2"
            >
              重试
            </button>
          </div>
        </div>
      </div>

      <!-- 版本信息内容 -->
      <div v-else class="card-body">
        <!-- 当前版本信息 -->
        <div class="mb-4">
          <h6 class="mb-3 d-flex align-items-center gap-2 text-primary">
            <i class="bi bi-info-circle"></i>
            当前版本信息
          </h6>
          <div class="card border rounded-lg">
            <div class="card-body">
              <div class="row mb-2">
                <div class="col-sm-4 text-body-secondary">主题名称</div>
                <div class="col-sm-8 text-body">{{ themeName }}</div>
              </div>
              <div class="row mb-2">
                <div class="col-sm-4 text-body-secondary">当前版本</div>
                <div class="col-sm-8 fw-bold text-body">{{ currentVersion }}</div>
              </div>
              <div class="row">
                <div class="col-sm-4 text-body-secondary">检查时间</div>
                <div class="col-sm-8 text-body-secondary">{{ lastCheckTime || '未检测' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 最新版本信息 -->
        <div v-if="latestVersion" class="mb-4">
          <h6 class="mb-3 d-flex align-items-center gap-2 text-success">
            <i class="bi bi-star"></i>
            最新版本信息
          </h6>
          <div class="card border rounded-lg overflow-hidden">
            <div class="card-body">
              <div class="row mb-2">
                <div class="col-sm-4 text-body-secondary">最新版本</div>
                <div class="col-sm-8">
                  <span class="fw-bold" :class="hasUpdate ? 'text-success' : 'text-info'">
                    {{ latestVersion.version }}
                  </span>
                  <span 
                    v-if="hasUpdate" 
                    class="badge text-bg-success ms-2"
                  >
                    新版本
                  </span>
                  <span 
                    v-else 
                    class="badge text-bg-info ms-2"
                  >
                    当前最新
                  </span>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-sm-4 text-body-secondary">发布时间</div>
                <div class="col-sm-8 text-body-secondary">{{ formatDate(latestVersion.create_time) }}</div>
              </div>
              <div class="mb-3">
                <span class="text-body-secondary d-block mb-2">更新内容</span>
                <div class="card border rounded p-3 article-content">
                  <i-markdown :model-value="latestVersion.content"></i-markdown>
                </div>
              </div>
              <div v-if="hasUpdate">
                <!-- 下载按钮 -->
                <a 
                  :href="latestVersion.download_url || latestVersion.url" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="btn btn-primary w-full mb-3"
                >
                  <i class="bi bi-download me-2"></i>下载{{ latestVersion.version }}版本源码
                </a>
                
                <!-- 本地打包部署提示 -->
                <div class="alert alert-info">
                  <h6 class="fw-bold mb-2">本地打包部署：</h6>
                  <ol class="mb-0 text-body">
                    <li class="mb-1">点击上方按钮下载最新版本源码压缩包</li>
                    <li class="mb-1">解压源码压缩包到本地目录</li>
                    <li class="mb-1">在目录下打开终端，执行 <code class="bg-body-secondary">npm install</code> 安装依赖</li>
                    <li class="mb-1">修改 <code class="bg-body-secondary">.env</code> 文件，将 <code class="bg-body-secondary">VITE_API_URI</code>、<code class="bg-body-secondary">VITE_SOCKET_URI</code> 等配置改为你自己的后端地址</li>
                    <li class="mb-1">执行 <code class="bg-body-secondary">npm run build</code> 构建生成 <code class="bg-body-secondary">dist</code> 目录</li>
                    <li class="mb-1">将 <code class="bg-body-secondary">dist</code> 目录内的所有文件上传到你的服务器主题目录</li>
                    <li class="mb-1">打开你的主题域名，同时按住快捷键 <kbd>Ctrl+Shift+R</kbd> 强制刷新网页缓存即可！</li>
                  </ol>
                </div>
              </div>
              <div v-else class="text-center py-3">
                <span class="text-body-secondary">您的主题已是最新版本</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 无新版本信息 -->
        <div v-else-if="!loading" class="mb-4">
          <h6 class="mb-3 d-flex align-items-center gap-2 text-body-secondary">
            <i class="bi bi-search"></i>
            版本检查
          </h6>
          <div class="card border rounded-lg text-center py-8">
            <i class="bi bi-info-circle text-body-secondary fs-3 mb-3"></i>
            <p class="text-body-secondary">点击右上角按钮检查是否有新版本</p>
          </div>
        </div>

        <!-- 版本历史按钮 -->
        <div v-if="versionHistory.length > 0" class="text-center mt-4">
          <button 
            class="btn btn-outline-secondary"
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#versionHistoryModal"
          >
            <i class="bi bi-clock-history me-2"></i>查看版本历史
          </button>
        </div>

        <!-- 版本历史模态框 -->
        <div class="modal fade" id="versionHistoryModal" tabindex="-1" aria-labelledby="versionHistoryModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="versionHistoryModalLabel">
                  <i class="bi bi-clock-history text-body-secondary me-2"></i>
                  版本历史
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="list-group">
                  <div 
                    v-for="(version, index) in versionHistory" 
                    :key="version.id"
                    class="list-group-item border rounded-lg mb-3"
                  >
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <span class="fw-bold text-body">v{{ version.version }}</span>
                      <span class="text-sm text-body-secondary">{{ formatDate(version.create_time) }}</span>
                    </div>
                    <div class="article-content">
                      <i-markdown :model-value="version.content"></i-markdown>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { toast } from '@/utils/app'
import { cache } from '@/utils/network'
import { usePageTitle } from '@/utils/app'
import iMarkdown from '@/comps/custom/i-markdown.vue'

// 页面标题管理
const { setDynamicTitle } = usePageTitle()
setDynamicTitle('主题版本更新')

// 响应式数据
const loading = ref(false)
const error = ref('')
const currentVersion = ref('')
const latestVersion = ref(null)
const versionHistory = ref([])
const lastCheckTime = ref('')
const checkInterval = ref(null)

// 计算属性
// 当前版本
const currentVersionComputed = computed(() => {
  // 优先从环境变量中读取版本号
  if (import.meta.env.VITE_VERSION) {
    return import.meta.env.VITE_VERSION
  }
  // 默认版本
  return '1.0.1'
})

// 主题名称
const themeName = computed(() => {
  return 'xiao-inisv1-vue'
})

// 是否有更新
const hasUpdate = computed(() => {
  if (!latestVersion.value) return false
  return compareVersions(latestVersion.value.version, currentVersion.value) > 0
})

// 方法
// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '未知时间'
  
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 版本号比较函数
const compareVersions = (version1, version2) => {
  const v1 = version1.replace(/^v/i, '').split('.').map(Number)
  const v2 = version2.replace(/^v/i, '').split('.').map(Number)
  
  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0
    const num2 = v2[i] || 0
    
    if (num1 > num2) return 1
    if (num1 < num2) return -1
  }
  
  return 0
}

// GitHub Releases API 地址
const GITHUB_REPO = 'zhu885744/xiao-inisv1-vue'
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases`

// 检查更新
const checkForUpdates = async (forceRefresh = false) => {
  loading.value = true
  error.value = ''

  try {
    // 获取当前版本
    currentVersion.value = currentVersionComputed.value

    // 缓存键
    const cacheKey = 'theme_version_info'
    const cacheExpire = 60 * 60 // 缓存1小时

    // 尝试从缓存获取版本信息（除非强制刷新）
    if (!forceRefresh) {
      const cachedData = cache.get(cacheKey)
      if (cachedData) {
        latestVersion.value = cachedData.latestVersion
        versionHistory.value = cachedData.versionHistory || []
        lastCheckTime.value = cachedData.lastCheckTime
        loading.value = false
        // 检查是否有新版本
        if (hasUpdate.value) {
          toast.info(`发现新版本 v${latestVersion.value.version}`, {
            duration: 5000
          })
        }
        return
      }
    }

    // 调用 GitHub Releases API 获取最新版本
    const response = await fetch(GITHUB_API_URL)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const releases = await response.json()

    if (releases && releases.length > 0) {
      // 转换 GitHub Releases 数据格式
      versionHistory.value = releases.map(release => ({
        id: release.id,
        version: release.tag_name.replace(/^v/i, ''), // 移除版本号前的 v
        create_time: release.published_at,
        content: release.body || '暂无更新说明',
        url: release.html_url,
        download_url: release.assets.length > 0 ? release.assets[0].browser_download_url : null
      }))

      latestVersion.value = versionHistory.value[0]

      // 缓存版本信息
      const cacheData = {
        latestVersion: latestVersion.value,
        versionHistory: versionHistory.value,
        lastCheckTime: formatDate(Date.now())
      }
      cache.set(cacheKey, cacheData, cacheExpire)
      lastCheckTime.value = formatDate(Date.now())

      // 检查是否有新版本
      if (hasUpdate.value) {
        toast.info(`发现新版本 v${latestVersion.value.version}`, {
          duration: 5000
        })
      }
    } else {
      // 无版本信息
      latestVersion.value = null
      versionHistory.value = []
      cache.set(cacheKey, {
        latestVersion: null,
        versionHistory: [],
        lastCheckTime: formatDate(Date.now())
      }, cacheExpire)
      lastCheckTime.value = formatDate(Date.now())
    }
  } catch (err) {
    console.error('检查更新失败:', err)
    error.value = '无法连接到 GitHub，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 用户活跃检测
const isUserActive = () => {
  // 检测用户是否在最近5分钟内有活动
  const lastActivity = localStorage.getItem('lastUserActivity')
  if (!lastActivity) return true
  
  const now = Date.now()
  const last = parseInt(lastActivity)
  return (now - last) < 5 * 60 * 1000
}

// 监听用户活动
const listenUserActivity = () => {
  const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart']
  events.forEach(event => {
    document.addEventListener(event, () => {
      localStorage.setItem('lastUserActivity', Date.now().toString())
    }, { passive: true })
  })
}

// 初始化版本检测
const initVersionCheck = () => {
  // 页面加载时检测一次
  checkForUpdates()
  
  // 定时检测（每24小时检测一次）
  checkInterval.value = setInterval(() => {
    // 只有在用户活跃时检测
    if (isUserActive()) {
      checkForUpdates()
    }
  }, 24 * 60 * 60 * 1000)
}

// 组件挂载
onMounted(() => {
  // 监听用户活动
  listenUserActivity()
  
  // 初始化版本检测
  initVersionCheck()
})

// 组件卸载
onUnmounted(() => {
  // 清除定时器
  if (checkInterval.value) {
    clearInterval(checkInterval.value)
    checkInterval.value = null
  }
})
</script>

<style scoped>
/* 响应式设计 */
@media (max-width: 768px) {
  .py-12 {
    padding-top: 4rem !important;
    padding-bottom: 4rem !important;
  }
  
  .py-8 {
    padding-top: 3rem !important;
    padding-bottom: 3rem !important;
  }
}
</style>