<template>
    <v-app>
        <v-toolbar app dark color="primary">
            <!-- <v-toolbar-side-icon></v-toolbar-side-icon> -->

            <v-toolbar-title class="white--text">{{appdata.apptitle}}</v-toolbar-title>

            <v-spacer></v-spacer>

            <router-link to="/">
                <v-icon title="Lane Simulators">local_shipping</v-icon>
            </router-link>

            <router-link to="/settings" class="router-link">
                <v-icon title="Settings">settings</v-icon>
            </router-link>

            <router-link to="/test" class="router-link" v-if="appdata.is_dev">
                <v-icon title="Test">insert_chart</v-icon>
            </router-link>

            <router-link to="/about" class="router-link">
                <v-icon title="About">info</v-icon>
            </router-link>

            <router-link to="/help" class="router-link">
                <v-icon title="Help">help</v-icon>
            </router-link>
        </v-toolbar>
        <v-content fluid>
            <router-view style="font-size: smaller;"></router-view>
        </v-content>
    </v-app>
</template>

<script>
import HelloWorld from "./components/HelloWorld";
import HomePage from "./components/HomePage";
import { AppData } from "./main";
import { banner } from "./lib/Utility";

export default {
    name: "App",
    components: {
        HelloWorld,
        HomePage,
    },
    data() {
        return {
            appdata: AppData,
            home_component: null,
        };
    },
    methods: {
        on_click_me: function() {
            console.log("on_click_me", this.$routes);
            this.$refs["home_page"].say_hello();
        },
    },
    mounted() {
        banner(["App.vue.mounted"]);
    },
};
</script>

<style>
.router-link {
    margin-left: 1rem;
}
</style>