<template>
  <footer id="footer" class="fs-6 py-3 mt-2 bg-body-tertiary">
    <div class="container">
      <div class="text-center">
        <!-- 版权年份 -->
        <div class="text">
          Copyright © {{ state.year.start || '2020' }} ~ {{ state.year.end }} {{ state.site.struct?.title || '朱某的生活印记' }} 版权所有
        </div>
        <!-- ICP备案号 -->
        <div class="test">
          <a 
            :href="state.site.struct?.copy?.link || 'http://beian.miit.gov.cn/'" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-decoration-none hover-text-primary transition-opacity"
            aria-label="ICP备案查询"
          >
            {{ state.site.struct?.copy?.code || '请在后台填写备案号' }}
          </a>
        </div>
        <!-- 公安备案号 -->
        <div class="test">
          <a 
            :href="state.site.struct?.police?.link || 'https://beian.mps.gov.cn/#/query/webSearch'" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-decoration-none hover-text-primary transition-opacity"
            aria-label="公安网安备查询"
          >
            {{ state.site.struct?.police?.code || '请在后台填写公安备案号' }}
          </a>
        </div>
        <!-- 技术支持 - 中屏及以上显示 -->
        <div class="text" aria-label="技术支持">
          <span>Powered by </span>
          <a 
            href="https://github.com/zhu885744/inisv1" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-primary text-decoration-none hover-underline"
            title="inisv1 开源地址"
          >
            inis v{{ state.version.system }}
          </a>
          <span class="mx-1">|</span>
          <span>Theme by </span>
          <a 
            href="https://github.com/zhu885744/xiao-inis" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-primary text-decoration-none hover-underline"
            title="xiao 开源地址"
          >
            xiao v{{ state.version.theme }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { reactive, onMounted, watch } from 'vue'
import utils from '@/utils/utils'
import cache from '@/utils/cache'
import axios from '@/utils/request'

// 统一获取环境变量版本号，方便维护
const VITE_APP_VERSION = import.meta.env.VITE_VERSION || '1.0.0-beta'

// 状态管理：补全police/title字段，移除inis依赖，全量兜底
const state = reactive({
  year: {
    start: null, // 起始年份（接口返回date时间戳解析）
    end: new Date().getFullYear() // 结束年份（当前年份）
  },
  site: {
    show: false,
    struct: {
      title: '', // 站点标题（版权信息用）
      copy: {},  // ICP备案信息
      police: {},// 公安备案信息
      date: ''   // 起始时间戳
    }
  },
  // 版本号：系统+主题分别读取环境变量，接口成功则覆盖
  version: {
    theme: VITE_APP_VERSION, // xiao主题版本
    system: VITE_APP_VERSION // inis系统版本
  },
})

const method = {
  // 获取站点信息：适配API Query参数+SYSTEM_屏蔽规则+缓存+异常兜底
  // 替换footer.vue中的method.site方法
  site: async () => {
  const cacheName = 'site-info'
  // 如需开启缓存，取消下面的注释即可（当前注释了缓存，强制每次请求接口）
    if (cache.has(cacheName)) {
      state.site.struct = cache.get(cacheName)
      console.log('【页脚】从前端缓存加载站点信息')
      return
    }

  try {
    // 极简传参：只传key=SITE_INFO，和其他人的请求一致，无需多余参数
    const res = await axios.get('/api/config/one', {
      key: 'SITE_INFO',
    })

    // 接口返回成功（code=200）
    if (res && res.code === 200) {
      const siteData = res.data?.json || {}
      // 适配SYSTEM_屏蔽规则：屏蔽后res.data.json会为空/无核心字段
      const isShielded = utils.is.empty(siteData) || utils.is.empty(siteData.title)
      
      if (isShielded) {
        console.warn('【页脚】SITE_INFO为SYSTEM_开头敏感数据，无管理权限已被屏蔽，使用兜底值')
      } else {
        // 正常更新状态+写入缓存（10分钟）
        state.site.struct = siteData
        cache.set(cacheName, siteData, 10)
        console.log('【页脚】从接口加载站点信息成功，数据：', siteData)
      }
    } else {
      console.warn('【页脚】站点信息接口返回格式异常，使用兜底值：', res)
    }
  } catch (error) {
    console.error('【页脚】站点信息接口请求失败，使用兜底值：', error.message)
  }
  },
  // 获取系统版本：适配接口+缓存+异常兜底
  version: async () => {
    const cacheName = 'system-version-local'
    // 前端缓存存在则直接使用
     if (cache.has(cacheName)) {
       state.version.system = cache.get(cacheName)
       console.log('【页脚】从前端缓存加载系统版本')
       return
     }

    try {
      const res = await axios.get('/dev/info/version')
      // 接口返回正常则更新版本+写入缓存
      if (res && res.code === 200 && res.data?.inis) {
        state.version.system = res.data.inis
        cache.set(cacheName, res.data.inis, 10)
        console.log('【页脚】从接口加载系统版本成功：', res.data.inis)
      } else {
        console.warn('【页脚】系统版本接口返回格式异常，使用环境变量版本：', res)
      }
    } catch (error) {
      console.error('【页脚】系统版本接口请求失败，使用环境变量版本：', error)
    }
  },
  // 时间戳转年份：增加健壮性判断，适配秒级时间戳
  year: (timestamp = '') => {
    if (utils.is.empty(timestamp) || isNaN(parseInt(timestamp))) return new Date().getFullYear()
    const milliseconds = parseInt(timestamp) * 1000 // 秒级转毫秒级
    const date = new Date(milliseconds)
    return date.getFullYear() || new Date().getFullYear() // 解析失败则返回当前年份
  }
}

// 组件挂载：并行请求接口，一个失败不影响另一个
onMounted(async () => {
  await Promise.allSettled([method.site(), method.version()])
})

// 深度监听站点信息变化：更新显示状态
watch(() => state.site.struct, (value) => {
  state.site.show = !utils.is.empty(value)
}, { deep: true })

// 仅监听date字段变化：解析起始年份，立即执行初始化
watch(() => state.site.struct?.date, (timestamp) => {
  state.year.start = method.year(timestamp)
}, { immediate: true })
</script>