import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import vuetify from 'vite-plugin-vuetify'


const electronEntry = resolve(__dirname, 'src/electron/electron.ts');
const electronPreloadEntry = resolve(__dirname, 'src/electron/preload.ts');
const htmlEntry = resolve(__dirname, 'index.html');

// https://electron-vite.org/config/
export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
        build: {
            // ssr: false,
            rollupOptions: {
                input: {
                    index: electronEntry
                }
            },
            sourcemap: true
        },
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
        build: {
            // ssr: false,
            rollupOptions: {
                input: {
                    index: electronPreloadEntry
                },
                external: ['electron']  // Don't externalize Node modules
            },
            sourcemap: true
        },
    },
    renderer: {
        root: '.',
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src')
            }
        },
        plugins: [
            vue(),
            vuetify({ autoImport: true })
        ],
        build: {
            rollupOptions: {
                input: htmlEntry
            },
            sourcemap: true
        }
    },
})
