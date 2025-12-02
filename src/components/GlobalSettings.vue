<template>
    <v-card>
        <v-card-title>
            <span class="headline">Global Settings</span>
        </v-card-title>
        <v-card-text>
            <v-row>
                <v-col cols="12" sm="1" lg="3">
                    <v-text-field label="Gamma Background" v-model="settings.DefaultGammaBG"></v-text-field>
                </v-col>
                <v-col cols="12" sm="1" lg="3">
                    <v-text-field label="Neutron Background" v-model="settings.DefaultNeutronBG"></v-text-field>
                </v-col>
                <v-col cols="12" sm="1" lg="3">
                    <v-text-field label="GH Threshold" v-model="settings.DefaultGHThreshold"></v-text-field>
                </v-col>
                <v-col cols="12" sm="1" lg="3">
                    <v-text-field label="GL Threshold" v-model="settings.DefaultGLThreshold"></v-text-field>
                </v-col>
                <v-col cols="12" sm="1" lg="3">
                    <v-text-field label="NH Threshold" v-model="settings.DefaultNHThreshold"></v-text-field>
                </v-col>
                <v-col cols="12" sm="1" lg="3">
                    <v-text-field label="Gamma N-Sigma" v-model="settings.DefaultGammaNSigma"></v-text-field>
                </v-col>
                <v-col cols="12" sm="1" lg="3">
                    <v-text-field label="Neutron Threshold" v-model="settings.DefaultNeutronThreshold"></v-text-field>
                </v-col>
                <v-col cols="12" sm="1" lg="3">
                    <v-text-field label="GA Probability" v-model="settings.DefaultAutoGammaProbability"></v-text-field>
                </v-col>
                <v-col cols="12" sm="1" lg="3">
                    <v-text-field label="NA Probability"
                        v-model="settings.DefaultAutoNeutronProbability"></v-text-field>
                </v-col>
                <v-col cols="12" sm="1" lg="3">
                    <v-text-field label="Auto Interval" v-model="settings.DefaultAutoInterval"></v-text-field>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green" variant="tonal" @click="save()">Save</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
import { Ref, ref } from "vue";
import { AppData } from "../main";
import { ISettings } from "../lib/ISettings";
import { AppVersion } from "../lib/Globals";
import { Settings } from "../lib/settings";

export default {
    setup: () => {
        const settings: Ref<ISettings> = ref(Settings.default());

        return {
            settings,
        };
    },
    // data: () => ({
    //     settings: {
    //         DefaultGammaBG: 0,
    //         DefaultNeutronBG: 3,
    //         DefaultGammaDistribution: [0.25, 0.25, 0.25, 0.25],
    //         DefaultNeutronDistribution: [0.25, 0.25, 0.25, 0.25],
    //         DefaultGammaNSigma: 7,
    //         DefaultNeutronThreshold: 7,
    //         DefaultGHThreshold: 300,
    //         DefaultGLThreshold: 100,
    //         DefaultNHThreshold: 7,
    //         DefaultAutoGammaProbability: 0.05,
    //         DefaultAutoNeutronProbability: 0.05,
    //         DefaultAutoInterval: 30.0,
    //     },
    // }),
    beforeCreate: function() {
        console.log("In beforeCreate", AppData);
    },
    created: function() {
        // trick to save untracked data - created() is called after
        // reactive hooks are in place
        Settings.copy(AppData.settings.Data, this.settings);
    },
    methods: {
        save: function() {
            Settings.copy(this.settings, AppData.settings.Data);
            AppData.settings.save();
        },
    },
};
</script>
