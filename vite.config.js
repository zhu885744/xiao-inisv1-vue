import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            preserveWhitespace: false
          }
        }
      })
    ],
    // 生产环境构建优化
    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'static',
      cacheDir: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue']
          }
        }
      },
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: []
        }
      }
    },
    // 解析别名
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'vue': path.resolve(__dirname, 'node_modules/vue/dist/vue.esm-bundler.js')
      }
    },
    // 服务环境静态资源路径适配
    base: './',
    // 开发服务器配置
    server: {
      // API代理配置
      proxy: {
        '/api': {
          target: 'https://cs.zhuxu.asia', // 假设后端服务运行在8000端口
          changeOrigin: true,
          rewrite: (path) => path
        }
      }
    }
  }
})