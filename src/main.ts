/// <reference path="./electron/main/global.d.ts" />

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// Components
import { SettingsManager } from "./lib/settings";
import { RPMSimulator } from './lib/RPMSimulator'
import { ProfileGenerator2 } from './lib/ProfileGenerator2'

export let AppData = {
    apptitle: "RPM Lane Simulator",
    settings: new SettingsManager("settings.json"),
    testsim: new RPMSimulator("127.0.0.1", 1600, "Test Simulator", new ProfileGenerator2()),
    is_dev: process.env.NODE_ENV !== "production",
};


if (AppData.settings.Data.Lanes.length == 0) {
    AppData.settings.add_lane("Lane 1", "127.0.0.1", 1601);
    AppData.settings.save();
}

// make a directory for replay data if one doesn't exist
if (window.electronAPI && !window.electronAPI.existsSync("Replay")) {
    window.electronAPI.mkdir("Replay", err => {
        return;
    });
}


const vuetify = createVuetify({
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  components,
  directives,
});

const app = createApp(App)

app.use(createPinia()) //use pinia
app.use(router) //use router
app.use(vuetify)
app.mount('#app')
