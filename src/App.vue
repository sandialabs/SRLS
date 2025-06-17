
<template>
    <v-app>
        <v-toolbar app dark color="primary">

            <v-toolbar-title class="white--text">{{appdata.apptitle}}</v-toolbar-title>

            <v-spacer></v-spacer>

            <router-link to="/">
                <v-icon title="Lane Simulators">local_shipping</v-icon>
            </router-link>

            <router-link to="/settings" class="router-link">
                <v-icon title="Settings">settings</v-icon>
            </router-link>

            <!-- <router-link to="/test" class="router-link" v-if="appdata.is_dev">
                <v-icon title="Test">insert_chart</v-icon>
            </router-link> -->

            <router-link to="/about" class="router-link">
                <v-icon title="About">info</v-icon>
            </router-link>

            <router-link to="/help" class="router-link">
            <v-icon icon="$vuetify"></v-icon>
                <v-icon title="Help">help</v-icon>
            </router-link>
        </v-toolbar>
        <v-content fluid>
            <router-view style="font-size: smaller;"></router-view>
            <v-icon icon="mdiTruck"></v-icon>
        </v-content>
        <v-icon icon="$vuetify"></v-icon>
  <!-- <HelloWorld msg="Vite + Vue 3 + Electron + TypeScript" /> -->
  </v-app>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
import HomePage from "./components/HomePage.vue";
import { AppData } from "./main";
import { banner } from "./lib/Utility.ts";

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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
img {
  margin: 5px;
}
.plugins {
  font-size: 20px;
  font-weight: bold;
  margin-top: 20px;
}
.router-link {
    margin-left: 1rem;
}
</style>
