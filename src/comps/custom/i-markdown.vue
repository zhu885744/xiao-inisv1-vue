<!-- src\comps\custom\i-markdown.vue 文章markdown内容渲染组件 -->
<template>
  <div class="markdown-content" v-html="renderedMd"></div>
</template>

<script setup>
import { ref, watch } from 'vue'
// 导入marked核心渲染方法
import { marked } from 'marked'
// 导入highlight.js库和样式
import hljs from 'highlight.js'
import 'highlight.js/styles/agate.css'

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
  
  // 简单处理：直接使用highlight.js处理所有代码
  let processedContent = content
  
  // 匹配并处理代码块
  processedContent = processedContent.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    try {
      const highlighted = hljs.highlight(code, { language: lang || 'plaintext' }).value
      return `<pre class="hljs"><code class="language-${lang || 'plaintext'}">${highlighted}</code></pre>`
    } catch (error) {
      console.error('代码高亮处理失败:', error)
      return `<pre class="hljs"><code>${code}</code></pre>`
    }
  })
  
  // 渲染Markdown
  let html = marked.parse(processedContent, {
    gfm: true,
    breaks: true,
    html: true
  })
  
  // 为所有图片添加 data-fancybox 属性
  html = html.replace(/<img\s+src="([^"]+)"\s+alt="([^"]*)"\s*(.*?)\s*>/g, '<a href="$1" data-fancybox="gallery" data-caption="$2"><img src="$1" alt="$2" $3></a>')
  
  // 安全处理超链接
  html = html.replace(/<a\s+([^>]*)>/g, (match, attributes) => {
    let safeAttributes = attributes.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
    safeAttributes = safeAttributes.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
    if (!safeAttributes.match(/target\s*=/i)) {
      safeAttributes += ' target="_blank"'
    }
    if (!safeAttributes.match(/rel\s*=/i)) {
      safeAttributes += ' rel="noopener noreferrer"'
    }
    return `<a ${safeAttributes}>`
  })
  
  renderedMd.value = html
}

// 首次加载立即渲染
renderMarkdown(props.modelValue)

// 监听内容变化，重新渲染
watch(
  () => props.modelValue,
  (newVal) => renderMarkdown(newVal),
  { immediate: true, deep: false }
)
</script>

<style>
/* 代码块样式 */
pre {
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.2rem;
  overflow-x: auto;
  border: 1px solid var(--bs-border-color);
  background-color: #282c34;
}

/* 行内代码样式 */
code:not(pre code) {
  background-color: var(--bs-tertiary-bg);
  padding: 0.15rem 0.3rem;
  border-radius: 0.25rem;
  font-size: 0.95em;
  color: var(--bs-body-color);
}

/* 适配深色模式下行内代码 */
.dark code:not(pre code) {
  background-color: #334155;
  color: #f8fafc;
}
</style>