import { defineStore } from "pinia";
import { SettingsManager } from "../lib/SettingsManager";
import { markRaw } from "vue";
import { ILaneSettings } from "../lib/ILaneSettings";

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        settingsManager: new SettingsManager(),
        isLoaded: false
    }),

    getters: {
        lanes(): ILaneSettings[] {
            return this.settingsManager.lanes || [];
        }
    },

    actions: {
        async loadSettings() {
            if(!this.isLoaded) {
                await this.settingsManager.initialize("settings.json");
                this.isLoaded = true;
            }
        }
    },
})
