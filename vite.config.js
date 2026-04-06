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
        // 指定要处理的 SVG 图标目录
        iconDirs: [path.resolve(__dirname, 'src/assets/svg')],
        // 指定生成的 symbol ID 格式
        symbolId: 'icon-[name]',
        // 是否在构建时生成 sprite
        inject: 'body-last',
        // 是否在开发模式下自动注入
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
      chunkSizeWarningLimit: 300,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            bootstrap: ['bootstrap', '@popperjs/core'],
            fancybox: ['@fancyapps/ui'],
            marked: ['marked'],
            highlight: ['highlight.js'],
            utils: ['axios', 'crypto-js', 'qs']
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

    // 【核心修改1】生产环境base设为绝对路径/，开发环境保持/不变
    base: '/',

    server: {
      port: 3000,
      open: true,
      cors: true,
      // 增加服务器响应超时时间
      timeout: 60000,
      // 启用HTTP2，提高传输效率
      http2: false,
      // 配置缓存
      hmr: {
        overlay: false,
        timeout: 3000
      },
      // 配置代理
      proxy: {
        '/api': {
          target: 'https://cs.zhuxu.asia',
          changeOrigin: true,
          // 增加代理超时时间
          timeout: 60000,
          // 启用WebSocket代理
          ws: true
        },
      }
    },

    optimizeDeps: {
      include: ['vue'],
    }
  }
})