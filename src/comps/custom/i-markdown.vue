<!-- src\comps\custom\i-markdown.vue 文章markdown内容渲染组件 -->
<template>
  <span v-html="renderedMd"></span>
</template>

<script setup>
import { ref, watch, defineProps } from 'vue'
// 导入marked核心渲染方法（v17+ 直接导入marked即可）
import { marked } from 'marked'

// props规范
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

// 存储渲染后的HTML结果
const renderedMd = ref('')

// 初始化渲染方法
const renderMarkdown = (content) => {
  if (!content) {
    renderedMd.value = ''
    return
  }
  // marked直接渲染Markdown为HTML，开启HTML解析（适配文章中的HTML标签）
  let html = marked.parse(content, {
    gfm: true, // 开启GitHub风格的Markdown
    breaks: true, // 换行符转换为<br>
    html: true, // 允许解析内容中的HTML标签（关键，和你原有需求一致）
  })
  
  // 为所有图片添加 data-fancybox 属性，实现图片灯箱功能
  html = html.replace(/<img\s+src="([^"]+)"\s+alt="([^"]*)"\s*(.*?)\s*>/g, '<a href="$1" data-fancybox="gallery" data-caption="$2"><img src="$1" alt="$2" $3></a>')
  
  renderedMd.value = html
}

// 首次加载立即渲染
renderMarkdown(props.modelValue)

// 监听内容变化，重新渲染（适配文章数据加载后的更新）
watch(
  () => props.modelValue,
  (newVal) => renderMarkdown(newVal),
  { immediate: true, deep: false }
)
</script>