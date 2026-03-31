<template>
    <v-layout row>
        <v-dialog v-model="dialog" fullscreen hide-overlay persistent transition="dialog-bottom-transition">
            <v-card>
                <v-card-title style="margin-top: 60px; margin-bottom: 0;">
                    <v-spacer />
                    <span class="headline">{{ title }}</span>
                    <v-spacer />
                </v-card-title>

                <v-card-text>
                    <!-- <span>Settings: {{ settings }}</span> -->
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

                        <!-- Tabs navigation -->
                        <v-tabs v-model="activetab" color="blue" variant="dark">
                            <v-tab value="RPM">RPM</v-tab>
                            <v-tab value="Cameras">Cameras</v-tab>
                        </v-tabs>

                        <!-- Tabs content -->

                        <v-tabs-window v-model="activetab">
                            <!-- RPM Tab Content -->
                            <v-tabs-window-item value="RPM">
                                <!-- First row: four text fields -->
                                <v-row justify="center">
                                    <v-col cols="12" sm="3" md="3">
                                        <v-text-field label="GB" v-model="settings.RPM.GammaBG"
                                            hint="Single detector gamma background level"
                                            persistent-hint></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="3" md="3">
                                        <v-text-field label="NB" v-model="settings.RPM.NeutronBG"
                                            hint="Single detector neutron background level"
                                            persistent-hint></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="3" md="3">
                                        <v-text-field label="N-Sigma" v-model="settings.RPM.GammaNSigma"
                                            hint="Max n-sigma for gamma alarms" persistent-hint></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="3" md="3">
                                        <v-text-field label="NA" v-model="settings.RPM.NeutronThreshold"
                                            hint="Single detector neutron alarm threshold"
                                            persistent-hint></v-text-field>
                                    </v-col>
                                </v-row>

                                <!-- Second row: four fields -->
                                <v-row justify="center">
                                    <v-col cols="12" sm="3" md="3">
                                        <v-text-field label="GH" v-model="settings.RPM.GHThreshold"
                                            hint="Single detector gamma background high threshold"
                                            persistent-hint></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="3" md="3">
                                        <v-text-field label="GL" v-model="settings.RPM.GLThreshold"
                                            hint="Single detector gamma background low threshold"
                                            persistent-hint></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="3" md="3">
                                        <v-text-field label="NH" v-model="settings.RPM.NHThreshold"
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
                                        <v-text-field label="GA %" v-model="settings.AutoGammaProbability"
                                            hint="Percentage of occupancies that will have a gamma alarm"
                                            persistent-hint></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="3" md="3">
                                        <v-text-field label="NA %" v-model="settings.AutoNeutronProbability"
                                            hint="Percentage of occupancies that will have a gamma alarm"
                                            persistent-hint></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="3" md="3">
                                        <v-text-field label="Interval" v-model="settings.AutoInterval"
                                            hint="Number of seconds between occupancies" persistent-hint></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-tabs-window-item>

                            <!-- Cameras Tab Content -->
                            <v-tabs-window-item value="Cameras">
                                <v-row align="center" justify="center" class="fill-height" direction="column">
                                    <v-col cols="12">
                                        <v-row>
                                            <!-- Camera 1 -->
                                            <v-col cols="12" sm="6">
                                                <h3 style="margin-bottom: 1rem;">Camera 1</h3>
                                                <v-text-field label="Name"
                                                    v-model="settings.Cameras[0].Name"></v-text-field>
                                                <table style="width: 100%;">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <v-select class="mr-4" @change="on_camera_selected(0)"
                                                                    :items="camera_definitions" item-text="name"
                                                                    item-value="id" v-model="selected_camdef[0]"
                                                                    label="Manufacturer"></v-select>
                                                            </td>
                                                            <td>
                                                                <v-select @change="on_camera_model_selected(0)"
                                                                    :items="camera_models[0]"
                                                                    v-model="settings.Cameras[0].Model"
                                                                    label="Model"></v-select>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <table style="width: 100%;">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <v-text-field class="mr-4" label="IP"
                                                                    v-model="settings.Cameras[0].IPAddr"></v-text-field>
                                                            </td>
                                                            <td>
                                                                <v-text-field label="Port"
                                                                    v-model="settings.Cameras[0].Port"></v-text-field>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <v-text-field label="URL"
                                                    v-model="settings.Cameras[0].URL"></v-text-field>
                                                <v-select :items="camtypes" label="Simulation Type"
                                                    v-model="settings.Cameras[0].CameraSimulatorType"></v-select>
                                                <v-checkbox label="Enabled"
                                                    v-model="settings.Cameras[0].Enabled"></v-checkbox>
                                            </v-col>

                                            <!-- Camera 2 -->
                                            <v-col cols="12" sm="6">
                                                <h3 style="margin-bottom: 1rem;">Camera 2</h3>
                                                <v-text-field label="Name"
                                                    v-model="settings.Cameras[1].Name"></v-text-field>
                                                <table style="width: 100%;">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <v-select class="mr-4" @change="on_camera_selected(1)"
                                                                    :items="camera_definitions" item-text="name"
                                                                    item-value="id" v-model="selected_camdef[1]"
                                                                    label="Manufacturer"></v-select>
                                                            </td>
                                                            <td>
                                                                <v-select @change="on_camera_model_selected(1)"
                                                                    :items="camera_models[1]"
                                                                    v-model="settings.Cameras[1].Model"
                                                                    label="Model"></v-select>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <table style="width: 100%;">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <v-text-field class="mr-4" label="IP"
                                                                    v-model="settings.Cameras[1].IPAddr"></v-text-field>
                                                            </td>
                                                            <td>
                                                                <v-text-field label="Port"
                                                                    v-model="settings.Cameras[1].Port"></v-text-field>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <v-text-field label="URL"
                                                    v-model="settings.Cameras[1].URL"></v-text-field>
                                                <v-select :items="camtypes" label="Simulation Type"
                                                    v-model="settings.Cameras[1].CameraSimulatorType"></v-select>
                                                <v-checkbox label="Enabled"
                                                    v-model="settings.Cameras[1].Enabled"></v-checkbox>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                            </v-tabs-window-item>
                        </v-tabs-window>
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer />
                    <v-btn color="green darken-1" @click="save()">Save</v-btn>
                    <v-btn color="red darken-1" @click="dialog = false">Cancel</v-btn>
                    <v-spacer />
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>

<script lang="ts">
import { SettingsManager } from "../lib/SettingsManager";
import { CameraDefinitions, ICameraDefinitions } from "../lib/Globals";
import { ILaneSettings } from "../lib/ILaneSettings";
import { LaneSettings } from "../lib/LaneSettings";
import { Ref, ref } from "vue";
import { AppData } from '../lib/AppData';
import { ISettings } from "../lib/ISettings";
import { useSettingsStore } from "../store/settingsStore";

type LaneSettingsCallback = (settings: ILaneSettings) => void;

interface ICameraDefinitionShort {
    id: number,
    name: string,
}
/*
        dialog: false,
        activetab: null as number | null,
        title: "SETTINGS DIALOG",
        camera_models: [[], []] as [string[], string[]],
        selected_camdef: [undefined, undefined] as [undefined | number, undefined | number],
        camtypes: ["canned", "animated"],
        rpm_algorithms: ["simulated", "replay"],
        settings: { RPM: {}, Cameras: [{ Name: "" }, { Name: "" }] } as ILaneSettings,
        camera_definitions: [] as ICameraDefinitionShort[],
        callback: null as any | null,
*/
export default {
    setup: () => {
        let settingsStore = useSettingsStore();
        let laneSettings: LaneSettings = settingsStore.settingsManager.default_lane_settings("", "127.0.0.1", 9999);

        let dialog = ref(false);
        let activetab: Ref<number | null> = ref(null);
        let title = ref("SETTINGS DIALOG");
        let camera_models: Ref<[string[], string[]]> = ref([[], []]);
        let selected_camdef: Ref<[undefined | number, undefined | number]> = ref([undefined, undefined]);
        let camtypes: Ref<string[]> = ref(["canned", "animated"]);
        let rpm_algorithms: Ref<string[]> = ref(["simulated", "replay"]);
        let settings: Ref<LaneSettings> = ref<LaneSettings>(laneSettings);
        let camera_definitions: Ref<ICameraDefinitionShort[]> = ref([]);
        let callback: Ref<LaneSettingsCallback | null> = ref(null);

        return {
            dialog,
            activetab,
            title,
            camera_models,
            selected_camdef,
            camtypes,
            rpm_algorithms,
            settings,
            camera_definitions,
            callback
        };
    },
    // data: () => ({
    //     dialog: false,
    //     activetab: null as number | null,
    //     title: "SETTINGS DIALOG",
    //     camera_models: [[], []] as [string[], string[]],
    //     selected_camdef: [undefined, undefined] as [undefined | number, undefined | number],
    //     camtypes: ["canned", "animated"],
    //     rpm_algorithms: ["simulated", "replay"],
    //     settings: { RPM: {}, Cameras: [{ Name: "" }, { Name: "" }] } as ILaneSettings,
    //     camera_definitions: [] as ICameraDefinitionShort[],
    //     callback: null as any | null,
    // }),
    created: function () {
        // trick to save untracked data - created() is called after
        // reactive hooks are in place
        this.camera_definitions = [];
        for (let i = 0; i < CameraDefinitions.length; i++) {
            let def = CameraDefinitions[i];
            let obj: ICameraDefinitionShort = {
                id: i,
                name: def.manufacturer,
            };
            this.camera_definitions.push(obj);
        }
    },
    methods: {
        // callback function will receive LaneSettings object if saved
        open: function (title: string, newSettings: ILaneSettings, callback: LaneSettingsCallback) {
            console.log(`LaneSettings.open: title ${title}`, newSettings, callback);

            this.title = title;
            this.activetab = 0;
            this.dialog = true;

            this.settings = new LaneSettings(newSettings);
            // console.log("LaneSettings.vue settings", this.settings, newSettings);

            this.callback = callback;
            // console.log("LaneSettings.callback", this.callback);

            // this.find_camera_def(0);
            // this.find_camera_def(1);
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
        find_camera_def: function (camnum: number) {
            // see if the Manufacturer matches a predefined one and set selected_camdef
            //console.log("Looking for camera definition for camera " + camnum);
            let settings = this.settings.Cameras[camnum];
            //console.log("    Camera Settings", settings);
            let manufacturer = settings.Manufacturer;
            //console.log('    searching for "' + manufacturer + '"');
            let match = -1;
            for (let i = 0; i < CameraDefinitions.length; i++) {
                let camdef = CameraDefinitions[i];
                if (camdef.manufacturer == manufacturer) match = i;
            }
            if (match >= 0) {
                //console.log("    found " + manufacturer);
                this.selected_camdef[camnum] = match;
                let camdef = CameraDefinitions[match];
                this.camera_models[camnum] = camdef.models;
            }
        },
        camera_name: function (camdef: ICameraDefinitions) {
            let result = camdef.manufacturer + ":" + camdef.access;
            return result;
        },
        on_camera_selected: function (camid: number) {
            console.log("on_camera_selected", camid);
            let camdefid = this.selected_camdef[camid];
            if (!camdefid)
                return;
            let camdef = CameraDefinitions[camdefid];
            console.log("    Camera Definition: ", camdef);
            this.camera_models[camid] = camdef.models;
            this.settings.Cameras[camid].Manufacturer = camdef.manufacturer;
            this.settings.Cameras[camid].Model = camdef.models[0];
            this.settings.Cameras[camid].URL = camdef.url;
        },
        on_camera_model_selected: function (camnum: number) {
            let sel = this.settings.Cameras[camnum].Model;
            console.log("on_camera_model_selected", camnum, sel);
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