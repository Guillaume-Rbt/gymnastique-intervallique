import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'
// @ts-ignore
import htmlMinify from 'vite-plugin-html-minify'

export default defineConfig({
  plugins: [react(), UnoCSS(), htmlMinify(
    {
      collapseWhitespace: true,
    }
  )],
  base: "./",
  build: {
    sourcemap: false,
    outDir: "prod",
    assetsDir: "",
    emptyOutDir: true,
    minify: "terser",
    rollupOptions: {
      output: {
        entryFileNames: "js/[hash].js",
        chunkFileNames: "js/[hash].js",
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.names?.[0]?.split('.').pop()?.toLowerCase()
          if (ext === 'css') return 'css/[hash][extname]'
          if (['mp3', 'wav', 'ogg'].includes(ext ?? '')) return 'sound/[hash][extname]'
          return 'assets/[hash][extname]'
        },
      },

    },
    terserOptions: {
      compress:
      {
        drop_console: true,
      },
      format: {
        comments: false
      }
    },

  },

})
