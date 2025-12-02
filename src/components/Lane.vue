<template>
    <v-container>
        <v-layout row wrap>
            <v-flex xs1 md1 class="lane-icons">Icons</v-flex>
            <v-flex xs5 md2 class="lane-name">{{ settings.LaneName }}</v-flex>
            <v-flex xs6 md2 class="lane-rpm">RPM</v-flex>
            <v-flex xs6 md3 class="lane-camera1">{{ cam1 }}</v-flex>
            <v-flex xs6 md3 class="lane-camera2">{{ cam2 }}</v-flex>
        </v-layout>
    </v-container>
</template>

<script lang="ts">

import { PropType } from 'vue';
import { ILaneSettings } from '../lib/ILaneSettings';
import { ICameraSettings } from '../lib/ICameraSettings';

console.log("Lane.vue loaded");

export default {
    props: {
        settings: {
            type: Object as PropType<ILaneSettings>,
            required: true
        }
    },
    computed: {
        cam1: function (): string {
            return this.format(this.settings.Cameras[0]);
        },
        cam2: function (): string {
            return this.format(this.settings.Cameras[1]);
        }
    },
    methods: {
        format: function (cam?: ICameraSettings): string {
            if(!cam)
                return "No camera";
            return `${cam.Manufacturer} ${cam.Model} @ ${cam.IPAddr}:${cam.Port}`;
        },
    },
};
</script>

<style scoped>
.lane-icons {
    border: 1px solid red;
    padding: 1px;
}

.lane-name {
    border: 1px solid blue;
    padding: 1px;
}

.lane-rpm {
    border: 1px solid purple;
    padding: 1px;
}

.lane-camera1 {
    border: 1px solid red;
    padding: 1px;
}

.lane-camera2 {
    border: 1px solid black;
    padding: 1px;
}
</style>