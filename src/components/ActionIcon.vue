<template>
    <span>
        <v-tooltip v-if="tooltip" top v-bind:open-delay="delay">
            <template v-slot:activator="{ on }">
                <v-btn icon v-on="on" v-bind:disabled="disabled" style="margin: 0; padding: 0;">
                    <v-icon
                        v-bind:style="{ fontSize: size, margin: 0, padding: 0 }"
                        v-on:click="$emit('icon-clicked')"
                        :color="color"
                    >{{icon}}</v-icon>
                </v-btn>
            </template>
            <span>{{tooltip}}</span>
        </v-tooltip>
        <v-btn icon v-if="!tooltip" v-bind:style="{ fontSize: size, margin: 0, padding: 0 }">
            <v-icon
                v-on:click="$emit('icon-clicked')"
                :color="color"
                v-bind:style="{ fontSize: size, margin: 0, padding: 0 }"
            >{{icon}}</v-icon>
        </v-btn>
    </span>
</template>

<script>
import { Component, Vue } from "vue-property-decorator";

console.log("ActiveIcon.vue loaded");

export default {
    name: "ActiveIcon",
    props: {
        icon: { type: String, default: "home" },
        tooltip: { type: String },
        color: { type: String, default: "primary" },
        size: { type: String, default: "20px" },
        delay: { default: 1500 },
        disabled: { default: false }
    },
    computed: {},
    data: () => ({})
};
</script>

<style scoped>
</style>