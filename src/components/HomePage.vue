<template>
    <v-container fluid>
        <v-layout>
            <v-flex>
                <Lanes labeltext="Lanes" :settingsmgr="appdata.settings"/>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import { AppData } from "../main";
import Lanes from "./Lanes";

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
