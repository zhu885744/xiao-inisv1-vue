import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

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
      })
    ],

    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'static',
      cacheDir: false,
      minify: isProduction ? 'terser' : 'esbuild',
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
      proxy: {
        '/api': {
          target: 'https://cs.zhuxu.asia',
          changeOrigin: true,
        },
      }
    },

    optimizeDeps: {
      include: ['vue'],
    }
  }
})