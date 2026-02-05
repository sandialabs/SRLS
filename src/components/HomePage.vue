<template>
    <v-container fluid>
        <v-row>
            <v-col>
                <Lanes labeltext="Lanes"/>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { AppData } from '../lib/AppData';
import Lanes from "./Lanes.vue";

export default {
    name: "Home",
    data: () => ({
    }),
    components: {
        Lanes,
    },
    methods: {
        say_hello: () => {
            console.log("Hello from HomePage");
        },
    },
};
</script>

<style></style>
