<template>
    <v-card>
        <v-card-title>
            <span class="headline">Global Settings</span>
        </v-card-title>
        <v-card-text>
            <v-layout row wrap>
                <v-flex xs12 sm3 m1>
                    <v-text-field label="Gamma Background" v-model="settings.DefaultGammaBG"></v-text-field>
                </v-flex>
                <v-flex xs12 sm3 m1>
                    <v-text-field label="Neutron Background" v-model="settings.DefaultNeutronBG"></v-text-field>
                </v-flex>
                <v-flex xs12 sm3 m1>
                    <v-text-field label="GH Threshold" v-model="settings.DefaultGHThreshold"></v-text-field>
                </v-flex>
                <v-flex xs12 sm3 m1>
                    <v-text-field label="GL Threshold" v-model="settings.DefaultGLThreshold"></v-text-field>
                </v-flex>
                <v-flex xs12 sm3 m1>
                    <v-text-field label="NH Threshold" v-model="settings.DefaultNHThreshold"></v-text-field>
                </v-flex>
                <v-flex xs12 sm3 m1>
                    <v-text-field label="Gamma N-Sigma" v-model="settings.DefaultGammaNSigma"></v-text-field>
                </v-flex>
                <v-flex xs12 sm3 m1>
                    <v-text-field
                        label="Neutron Threshold"
                        v-model="settings.DefaultNeutronThreshold"
                    ></v-text-field>
                </v-flex>
                <v-flex xs12 sm3 m1>
                    <v-text-field
                        label="GA Probability"
                        v-model="settings.DefaultAutoGammaProbability"
                    ></v-text-field>
                </v-flex>
                <v-flex xs12 sm3 m1>
                    <v-text-field
                        label="NA Probability"
                        v-model="settings.DefaultAutoNeutronProbability"
                    ></v-text-field>
                </v-flex>
                <v-flex xs12 sm3 m1>
                    <v-text-field label="Auto Interval" v-model="settings.DefaultAutoInterval"></v-text-field>
                </v-flex>
            </v-layout>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" @click="save()">Save</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import { AppData } from "../main";
import { Settings, SettingsManager } from "../lib/settings";

export default {
    data: () => ({
        settings: {
            DefaultGammaBG: 0,
            DefaultNeutronBG: 3,
            DefaultGammaDistribution: [0.25, 0.25, 0.25, 0.25],
            DefaultNeutronDistribution: [0.25, 0.25, 0.25, 0.25],
            DefaultGammaNSigma: 7,
            DefaultNeutronThreshold: 7,
            DefaultGHThreshold: 300,
            DefaultGLThreshold: 100,
            DefaultNHThreshold: 7,
            DefaultAutoGammaProbability: 0.05,
            DefaultAutoNeutronProbability: 0.05,
            DefaultAutoInterval: 30.0,
        },
    }),
    beforeCreate: function() {
        console.log("In beforeCreate", AppData);
    },
    created: function() {
        // trick to save untracked data - created() is called after
        // reactive hooks are in place
        this.copy_settings(AppData.settings.Data, this.settings);
    },
    methods: {
        // callback function will receive LaneSettings object if saved
        copy_settings: function(from, to) {
            to["DefaultGammaBG"] = from["DefaultGammaBG"];
            to["DefaultNeutronBG"] = from["DefaultNeutronBG"];
            to["DefaultGammaDistribution"] = from["DefaultGammaDistribution"].slice(0);
            to["DefaultNeutronDistribution"] = from["DefaultNeutronDistribution"].slice(0);
            to["DefaultGammaNSigma"] = from["DefaultGammaNSigma"];
            to["DefaultNeutronThreshold"] = from["DefaultNeutronThreshold"];
            to["DefaultGHThreshold"] = from["DefaultGHThreshold"];
            to["DefaultGLThreshold"] = from["DefaultGLThreshold"];
            to["DefaultNHThreshold"] = from["DefaultNHThreshold"];
            to["DefaultAutoGammaProbability"] = from["DefaultAutoGammaProbability"];
            to["DefaultAutoNeutronProbability"] = from["DefaultAutoNeutronProbability"];
            to["DefaultAutoInterval"] = from["DefaultAutoInterval"];
        },

        save: function() {
            this.copy_settings(this.settings, AppData.settings.Data);
            AppData.settings.save();
        },
    },
};
</script>

<style scoped>
</style>