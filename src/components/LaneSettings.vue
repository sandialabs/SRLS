<template>
    <v-layout row>
        <v-dialog
            v-model="dialog"
            fullscreen
            hide-overlay
            persistent
            transition="dialog-bottom-transition"
        >
            <v-card>
                <v-card-title style="margin-top: 60px; margin-bottom: 0;">
                    <v-spacer></v-spacer>
                    <span class="headline">{{title}}</span>
                    <v-spacer></v-spacer>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap class="mt-0">
                            <v-flex xs12 sm6 m6>
                                <v-text-field label="Lane Name" v-model="settings.LaneName"></v-text-field>
                            </v-flex>
                            <v-flex xs12 sm4 m4>
                                <v-text-field label="RPM IP" v-model="settings.RPM.IPAddr"></v-text-field>
                            </v-flex>
                            <v-flex xs12 sm2 m2>
                                <v-text-field label="RPM Port" v-model="settings.RPM.Port"></v-text-field>
                            </v-flex>
                        </v-layout>
                        <v-tabs v-model="activetab" color="blue" dark>
                            <v-tab>RPM</v-tab>
                            <v-tab>Cameras</v-tab>
                            <v-tab-item
                                class="tab-body"
                                :transition="false"
                                :reverse-transition="false"
                            >
                                <v-layout center>
                                    <v-flex xs12 sm3 md3>
                                        <v-text-field
                                            label="GB"
                                            v-model="settings.RPM.GammaBG"
                                            hint="Single detector gamma background level"
                                            persistent-hint
                                        ></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm3 md3>
                                        <v-text-field
                                            label="NB"
                                            v-model="settings.RPM.NeutronBG"
                                            hint="Single detector neutron background level"
                                            persistent-hint
                                        ></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm3 md3>
                                        <v-text-field
                                            label="N-Sigma"
                                            v-model="settings.RPM.GammaNSigma"
                                            hint="Max n-sigma for gamma alarms"
                                            persistent-hint
                                        ></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm3 md3>
                                        <v-text-field
                                            label="NA"
                                            v-model="settings.RPM.NeutronThreshold"
                                            hint="Single detector neutron alarm threshold"
                                            persistent-hint
                                        ></v-text-field>
                                    </v-flex>
                                </v-layout>
                                <v-layout center>
                                    <v-flex xs12 sm3 md3>
                                        <v-text-field
                                            label="GH"
                                            v-model="settings.RPM.GHThreshold"
                                            hint="Single detector gamma background high threshold"
                                            persistent-hint
                                        ></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm3 md3>
                                        <v-text-field
                                            label="GL"
                                            v-model="settings.RPM.GLThreshold"
                                            hint="Single detector gamma background low threshold"
                                            persistent-hint
                                        ></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm3 md3>
                                        <v-text-field
                                            label="NH"
                                            v-model="settings.RPM.NHThreshold"
                                            hint="Single detector neutron background high threshold"
                                            persistent-hint
                                        ></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm3 md3>
                                        <v-select
                                            label="RPM Algorithm"
                                            :items="rpm_algorithms"
                                            v-model="settings.RPMAlgorithm"
                                        ></v-select>
                                    </v-flex>
                                </v-layout>
                                <v-layout wrap>
                                    <v-flex xs12 sm3 md3>
                                        <v-text-field
                                            label="GA %"
                                            v-model="settings.AutoGammaProbability"
                                            hint="Percentage of occupancies that will have a gamma alarm"
                                            persistent-hint
                                        ></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm3 md3>
                                        <v-text-field
                                            label="NA %"
                                            v-model="settings.AutoNeutronProbability"
                                            hint="Percentage of occupancies that will have a gamma alarm"
                                            persistent-hint
                                        ></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 sm3 md3>
                                        <v-text-field
                                            label="Interval"
                                            v-model="settings.AutoInterval"
                                            hint="Number of seconds between occupancies"
                                            persistent-hint
                                        ></v-text-field>
                                    </v-flex>
                                </v-layout>
                            </v-tab-item>
                            <v-tab-item
                                class="tab-body"
                                :transition="false"
                                :reverse-transition="false"
                            >
                                <v-layout align-space-between justify-center column fill-height>
                                    <v-flex sm12>
                                        <v-layout fill-width>
                                            <v-flex sm6>
                                                <h3 style="margin-bottom: 1rem;">Camera 1</h3>
                                                <v-text-field
                                                    label="Name"
                                                    v-model="settings.Cameras[0].Name"
                                                ></v-text-field>
                                                <table style="width:100%;">
                                                    <tr>
                                                        <td>
                                                            <v-select
                                                                class="mr-4"
                                                                @change="on_camera_selected(0)"
                                                                :items="camera_definitions"
                                                                item-text="name"
                                                                item-value="id"
                                                                v-model="selected_camdef[0]"
                                                                label="Manufacturer"
                                                            ></v-select>
                                                        </td>
                                                        <td>
                                                            <v-select
                                                                @change="on_camera_model_selected(0)"
                                                                :items="camera_models[0]"
                                                                v-model="settings.Cameras[0].Model"
                                                                label="Model"
                                                            ></v-select>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <table style="width: 100%;">
                                                    <tr>
                                                        <td>
                                                            <v-text-field
                                                                class="mr-4"
                                                                label="IP"
                                                                v-model="settings.Cameras[0].IPAddr"
                                                            ></v-text-field>
                                                        </td>
                                                        <td>
                                                            <v-text-field
                                                                label="Port"
                                                                v-model="settings.Cameras[0].Port"
                                                            ></v-text-field>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <v-text-field
                                                    label="URL"
                                                    v-model="settings.Cameras[0].URL"
                                                ></v-text-field>
                                                <v-select
                                                    :items="camtypes"
                                                    label="Simulation Type"
                                                    v-model="settings.Cameras[0].CameraSimulatorType"
                                                ></v-select>
                                                <v-checkbox
                                                    label="Enabled"
                                                    v-model="settings.Cameras[0].Enabled"
                                                ></v-checkbox>
                                            </v-flex>
                                            <v-flex sm16>
                                                <h3 style="margin-bottom: 1rem;">Camera 2</h3>
                                                <v-text-field
                                                    label="Name"
                                                    v-model="settings.Cameras[1].Name"
                                                ></v-text-field>
                                                <table style="width: 100%">
                                                    <tr>
                                                        <td>
                                                            <v-select
                                                                class="mr-4"
                                                                @change="on_camera_selected(1)"
                                                                :items="camera_definitions"
                                                                item-text="name"
                                                                item-value="id"
                                                                v-model="selected_camdef[1]"
                                                                label="Manufacturer"
                                                            ></v-select>
                                                        </td>
                                                        <td>
                                                            <v-select
                                                                @change="on_camera_model_selected(1)"
                                                                :items="camera_models[1]"
                                                                v-model="settings.Cameras[1].Model"
                                                                label="Model"
                                                            ></v-select>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <table style="width: 100%;">
                                                    <tr>
                                                        <td>
                                                            <v-text-field
                                                                class="mr-4"
                                                                label="IP"
                                                                v-model="settings.Cameras[1].IPAddr"
                                                            ></v-text-field>
                                                        </td>
                                                        <td>
                                                            <v-text-field
                                                                label="Port"
                                                                v-model="settings.Cameras[1].Port"
                                                            ></v-text-field>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <v-text-field
                                                    label="URL"
                                                    v-model="settings.Cameras[1].URL"
                                                ></v-text-field>
                                                <v-select
                                                    :items="camtypes"
                                                    label="Simulation Type"
                                                    v-model="settings.Cameras[1].CameraSimulatorType"
                                                ></v-select>
                                                <v-checkbox
                                                    label="Enabled"
                                                    v-model="settings.Cameras[1].Enabled"
                                                ></v-checkbox>
                                            </v-flex>
                                        </v-layout>
                                    </v-flex>
                                </v-layout>
                            </v-tab-item>
                        </v-tabs>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" @click="save()">Save</v-btn>
                    <v-btn color="red darken-1" @click="dialog = false">Cancel</v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>

<script>
import { RPMSettings, CameraSettings, LaneSettings, SettingsManager } from "../lib/settings";
import { CameraDefinitions } from "../lib/Globals";

export default {
    data: () => ({
        dialog: false,
        activetab: null,
        title: "SETTINGS DIALOG",
        camera_models: [[], []],
        selected_camdef: [undefined, undefined],
        camtypes: ["canned", "animated"],
        rpm_algorithms: ["simulated", "replay"],
        settings: { RPM: {}, Cameras: [{ Name: "" }, { Name: "" }] },
    }),
    created: function() {
        // trick to save untracked data - created() is called after
        // reactive hooks are in place
        this.callback = "undefined";
        this.camera_definitions = [];
        for (let i = 0; i < CameraDefinitions.length; i++) {
            let def = CameraDefinitions[i];
            let obj = {
                id: i,
                name: def.manufacturer,
            };
            this.camera_definitions.push(obj);
        }
    },
    methods: {
        // callback function will receive LaneSettings object if saved
        open: function(title, settings, callback) {
            this.title = title;
            this.activetab = 0;
            this.dialog = true;
            this.settings = SettingsManager.clone_lane(settings);
            this.callback = callback;
            console.log("LaneSettings.vue settings", settings);
            this.find_camera_def(0);
            this.find_camera_def(1);
        },
        save: function() {
            this.dialog = false;
            this.callback(this.settings);
        },
        close: function() {
            this.dialog = false;
        },
        find_camera_def: function(camnum) {
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
        camera_name: function(camdef) {
            let result = camdef.manufacturer + ":" + camdef.access;
            return result;
        },
        on_camera_selected: function(camid) {
            console.log("on_camera_selected", camid);
            let camdefid = this.selected_camdef[camid];
            let camdef = CameraDefinitions[camdefid];
            console.log("    Camera Definition: ", camdef);
            this.camera_models[camid] = camdef.models;
            this.settings.Cameras[camid].Manufacturer = camdef.manufacturer;
            this.settings.Cameras[camid].Model = camdef.models[0];
            this.settings.Cameras[camid].URL = camdef.url;
        },
        on_camera_model_selected: function(camnum) {
            let sel = this.settings.Cameras[camnum].Model;
            console.log("on_camera_model_selected", camnum, sel);
        },
    },
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