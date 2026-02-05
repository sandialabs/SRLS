import { defineStore } from "pinia";
import { SettingsManager } from "../lib/SettingsManager";
import { markRaw } from "vue";

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        settingsManager: markRaw(new SettingsManager()) as SettingsManager,
        isLoaded: false
    }),
    actions: {
        async loadSettings() {
            if(!this.isLoaded) {
                this.settingsManager = markRaw(await SettingsManager.create("settings.json"));
                this.isLoaded = true;
            }
        }
    },
})
