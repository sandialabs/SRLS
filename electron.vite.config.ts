import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import vuetify from 'vite-plugin-vuetify'
import pkg from './package.json'
import moment from "moment"
import { execSync } from 'child_process'

const electronEntry = resolve(__dirname, 'src/electron/electron.ts');
const electronPreloadEntry = resolve(__dirname, 'src/electron/preload.ts');
const htmlEntry = resolve(__dirname, 'index.html');

function getGitInfo() {
    let info = "UNKNOWN";

    try {
        info = execSync('git rev-parse --short HEAD').toString().trim();
    }
    catch {
    }

    return info;
}

// https://electron-vite.org/config/
export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';
    const dateStr = moment().format('YYYY/MM/DD');
    const gitInfo = getGitInfo();
    const buildDate = isProduction ? `${dateStr} (${gitInfo})` : `DEV -- ${dateStr}`;

    return {
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
            },
            define: {
                'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
                'import.meta.env.VITE_APP_BUILD_DATE': JSON.stringify(buildDate),
            }        
        },
    };
})
