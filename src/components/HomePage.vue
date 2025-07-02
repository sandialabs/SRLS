<template>
    <v-container fluid>
        <v-row>
            <v-col>
                <Lanes labeltext="Lanes" :settingsmgr="appdata.settings"/>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { AppData } from "../main";
import Lanes from "./Lanes.vue";

export default {
    name: "home",
    data: () => ({
        appdata: AppData,
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

<style>
</style>
