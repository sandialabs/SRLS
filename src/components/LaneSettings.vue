<template>
    <v-layout row>
        <v-dialog v-model="dialog" fullscreen hide-overlay persistent transition="dialog-bottom-transition">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ title }}</span>
                </v-card-title>

                <v-card-text>
                    <v-container>
                        <!-- First row of fields -->
                        <v-row class="mt-0">
                            <v-col cols="12" sm="6" md="6">
                                <v-text-field label="Lane Name" v-model="settings.LaneName"></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="4" md="4">
                                <v-text-field label="RPM IP" v-model="settings.RPM.IPAddr"></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="2" md="2">
                                <v-text-field label="RPM Port" v-model="settings.RPM.Port"></v-text-field>
                            </v-col>
                        </v-row>
                        <!-- First row: four text fields -->
                        <v-row justify="center">
                            <v-col cols="12" sm="3" md="3">
                                <v-text-field label="Gamma Background" v-model="settings.RPM.GammaBG"
                                    hint="Single detector gamma background level"
                                    persistent-hint></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="3" md="3">
                                <v-text-field label="Neutron Background" v-model="settings.RPM.NeutronBG"
                                    hint="Single detector neutron background level"
                                    persistent-hint></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="3" md="3">
                                <v-text-field label="N-Sigma" v-model="settings.RPM.GammaNSigma"
                                    hint="Max n-sigma for gamma alarms" persistent-hint></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="3" md="3">
                                <v-text-field label="Neutron Alarm" v-model="settings.RPM.NeutronThreshold"
                                    hint="Single detector neutron alarm threshold"
                                    persistent-hint></v-text-field>
                            </v-col>
                        </v-row>

                        <!-- Second row: four fields -->
                        <v-row justify="center">
                            <v-col cols="12" sm="3" md="3">
                                <v-text-field label="Gamma High" v-model="settings.RPM.GHThreshold"
                                    hint="Single detector gamma background high threshold"
                                    persistent-hint></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="3" md="3">
                                <v-text-field label="Gamma Low" v-model="settings.RPM.GLThreshold"
                                    hint="Single detector gamma background low threshold"
                                    persistent-hint></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="3" md="3">
                                <v-text-field label="Neutron High" v-model="settings.RPM.NHThreshold"
                                    hint="Single detector neutron background high threshold"
                                    persistent-hint></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="3" md="3">
                                <v-select label="RPM Algorithm" :items="rpm_algorithms"
                                    v-model="settings.RPMAlgorithm"></v-select>
                            </v-col>
                        </v-row>

                        <!-- Third row: three text fields -->
                        <v-row>
                            <v-col cols="12" sm="3" md="3">
                                <v-text-field label="Gamma Alarm %" v-model="settings.AutoGammaProbability"
                                    hint="Percentage of occupancies that will have a gamma alarm"
                                    persistent-hint></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="3" md="3">
                                <v-text-field label="Neutron Alarm %" v-model="settings.AutoNeutronProbability"
                                    hint="Percentage of occupancies that will have a gamma alarm"
                                    persistent-hint></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="3" md="3">
                                <v-text-field label="Interval" v-model="settings.AutoInterval"
                                    hint="Number of seconds between occupancies" persistent-hint></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-btn color="green" @click="save()">Save</v-btn>
                    <v-btn color="red" @click="close()">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>

<script lang="ts">
import { ILaneSettings } from "../lib/ILaneSettings";
import { LaneSettings } from "../lib/LaneSettings";
import { Ref, ref } from "vue";
import { useSettingsStore } from "../store/settingsStore";

type LaneSettingsCallback = (settings: ILaneSettings) => void;

interface ICameraDefinitionShort {
    id: number,
    name: string,
}
export default {
    setup: () => {
        let settingsStore = useSettingsStore();
        let laneSettings: LaneSettings = settingsStore.settingsManager.default_lane_settings("", "127.0.0.1", 9999);

        let dialog = ref(false);
        let title = ref("SETTINGS DIALOG");
        let rpm_algorithms: Ref<string[]> = ref(["simulated", "replay"]);
        let settings: Ref<LaneSettings> = ref<LaneSettings>(laneSettings);
        let callback: Ref<LaneSettingsCallback | null> = ref(null);

        return {
            dialog,
            title,
            rpm_algorithms,
            settings,
            callback
        };
    },
    created: function () {
        // trick to save untracked data - created() is called after
        // reactive hooks are in place
    },
    methods: {
        // callback function will receive LaneSettings object if saved
        open: function (title: string, newSettings: ILaneSettings, callback: LaneSettingsCallback) {
            console.log(`LaneSettings.open: title ${title}`, newSettings, callback);

            this.title = title;
            this.dialog = true;

            this.settings = new LaneSettings(newSettings);
            // console.log("LaneSettings.vue settings", this.settings, newSettings);

            this.callback = callback;
        },
        save: function () {
            this.dialog = false;
            if (this.callback)
                this.callback(this.settings);
        },
        close: function () {
            this.dialog = false;
            this.callback = null;
        },
    },
    computed: {
    }
};
</script>

<style scoped>
.h1 {
    font-size: 24px;
    font-weight: bold;
}

.tab-body {
    margin-top: 20px;
    border: 1px solid gray;
    border-radius: 12px;
    padding: 12px;
    height: 540px;
}
</style>