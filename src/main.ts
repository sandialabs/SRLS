/// <reference path="./electron/main/global.d.ts" />

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// import '@mdi/font/css/materialdesignicons.css'    // ← brings in mdi-*.css
// Vuetify
import 'vuetify/styles'
import vuetify from '../plugins/vuetify'

// Components
import { SettingsManager } from "./lib/SettingsManager";
// import { RPMSimulator } from './lib/RPMSimulator'
// import { ProfileGenerator2 } from './lib/ProfileGenerator2'

export interface IAppData {
    apptitle: string;
    settings: SettingsManager;
    // testsim: RPMSimulator | null;
    is_dev: boolean;
}

export let AppData: IAppData = {
    apptitle: "SRLS - Sandia RPM Lane Simulator",
    settings: new SettingsManager("settings.json"),
    // testsim: null,//new RPMSimulator("127.0.0.1", 1600, "Test Simulator", new ProfileGenerator2()),
    is_dev: process.env.NODE_ENV !== "production",
};

AppData.settings.create_default_lane();

// make a directory for replay data if one doesn't exist
if (window.electronAPI && !window.electronAPI.existsSync("Replay")) {
    window.electronAPI.mkdir("Replay", (err: any) => {
        if (err)
            console.error(String(err));
        return;
    });
}


// const vuetify = createVuetify({
//   icons: {
//     defaultSet: "mdi",
//     aliases,
//     sets: {
//       mdi,
//     },
//   },
//   components,
//   directives,
// });

const app = createApp(App)

app.use(createPinia()) //use pinia
app.use(router) //use router
app.use(vuetify)
app.mount('#app')
