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

<script lang>
import { Component, Vue } from "vue-property-decorator";

console.log("Lane.vue loaded");
export default {
    props: ["settings"],
    computed: {
        cam1: function () {
            let cam = this.settings.Camera1;
            return `${cam.Manufacturer} ${cam.Model} @ ${cam.IPAddr}:${cam.Port}`;
        },
        cam2: function () {
            let cam = this.settings.Camera2;
            return `${cam.Manufacturer} ${cam.Model} @ ${cam.IPAddr}:${cam.Port}`;
        }
    }
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