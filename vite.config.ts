import { defineConfig } from 'vite'
const vue = require('@vitejs/plugin-vue')
// import vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vuetify({ autoImport: true }), // Enabled by default
  ],
  base: './',
  server: {
    hmr: {
      overlay: false
    }
  }
})
