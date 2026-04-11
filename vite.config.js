import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            preserveWhitespace: false
          }
        }
      }),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(__dirname, 'src/assets/svg')],
        symbolId: 'icon-[name]',
        inject: 'body-last',
        customDomId: '__svg__icons__dom__'
      })
    ],

    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'static',
      cacheDir: false,
      minify: isProduction ? 'terser' : 'esbuild',
      sourcemap: false,
      // 提高警告上限
      chunkSizeWarningLimit: 1500,

      rollupOptions: {
        output: {
          // 【终极拆包：把超大的编辑器拆成 N 个小文件】
          manualChunks(id) {
            // 1. 高亮库（瘦身成功）
            if (id.includes('highlight.js')) {
              return 'highlight'
            }
            // 2. 编辑器核心（单独打包，不与语言混在一起）
            if (id.includes('codemirror') || id.includes('@codemirror')) {
              // 核心编辑器
              if (id.includes('codemirror/lib/codemirror.js') || id.includes('@codemirror/autocomplete') || id.includes('@codemirror/state') || id.includes('@codemirror/view')) {
                return 'editor-core'
              }
              // 编辑器语言（自动拆分小文件）
              if (id.match(/lang-[a-z]+/i) || id.includes('mode-') || id.includes('language-')) {
                return 'editor-lang'
              }
              // 编辑器插件
              return 'editor-plugin'
            }
            // 3. Vue 全家桶
            if (id.includes('node_modules/vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vue'
            }
            // 4. Bootstrap
            if (id.includes('bootstrap') || id.includes('@popperjs/core')) {
              return 'bootstrap'
            }
            // 5. 弹出层
            if (id.includes('@fancyapps/ui')) {
              return 'fancybox'
            }
            // 6. 解析器
            if (id.includes('marked')) {
              return 'marked'
            }
            // 7. 工具
            if (id.includes('axios') || id.includes('crypto-js') || id.includes('qs')) {
              return 'utils'
            }
          },

          assetFileNames: 'static/[name].[hash:8].[ext]',
          chunkFileNames: 'static/js/[name].[hash:8].js',
          entryFileNames: 'static/js/[name].[hash:8].js'
        }
      },

      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          dead_code: true,
          pure_funcs: ['console.log', 'console.warn', 'console.error']
        },
        format: {
          comments: false
        }
      },
    },

    resolve: {
      extensions: ['.vue', '.js', '.jsx', '.ts', '.tsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    },

    base: '/',

    server: {
      port: 3000,
      open: true,
      cors: true,
      timeout: 60000,
      http2: false,
      hmr: { overlay: false, timeout: 3000 },
      proxy: {
        '/api': {
          target: 'https://cs.zhuxu.asia',
          changeOrigin: true,
          timeout: 60000,
          ws: true
        }
      }
    },

    optimizeDeps: {
      include: ['vue'],
      // 【关键】禁止提前全量打包编辑器语言
      exclude: ['@codemirror/lang-*', 'codemirror/mode-*']
    }
  }
})