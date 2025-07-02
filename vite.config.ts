import { defineConfig } from 'vite'
const vue = require('@vitejs/plugin-vue')
// import vuetify from 'vite-plugin-vuetify'
// import vue from '@vitejs/plugin-vue'
import { transformAssetUrls } from 'vite-plugin-vuetify'
const vuetify = require('vite-plugin-vuetify')


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    vuetify({
      autoImport: true
    })
  ],
  base: './',
  server: {
    hmr: {
      overlay: false
    }
  }
})
