<!-- <template>
    <v-app>
        <v-toolbar app dark color="primary">

            <v-toolbar-title class="white--text">{{appdata.apptitle}}</v-toolbar-title>

            <v-spacer></v-spacer>

            <router-link to="/">
                <v-icon title="Lane Simulators">local_shipping</v-icon>
            </router-link>

            <router-link to="/settings" class="router-link">
                <v-icon title="Settings">settings</v-icon>
            </router-link> -->

<!-- <router-link to="/test" class="router-link" v-if="appdata.is_dev">
                <v-icon title="Test">insert_chart</v-icon>
            </router-link> -->

<!-- <router-link to="/about" class="router-link">
                <v-icon title="About">info</v-icon>
            </router-link>

            <router-link to="/help" class="router-link">
            <v-icon icon="$vuetify"></v-icon>
                <v-icon title="Help">help</v-icon>
            </router-link>
        </v-toolbar>
        <v-main fluid>
            <router-view style="font-size: smaller;"></router-view>
            <v-icon icon="mdiTruck"></v-icon>
        </v-main>
        <v-icon icon="$vuetify"></v-icon>
  </v-app>
</template> -->
<template>
    <v-app>
        <v-app-bar color="primary">
            <v-app-bar-title class="text-white">
                {{ appdata.apptitle }}
            </v-app-bar-title>

            <v-spacer></v-spacer>

            <v-btn to="/" icon variant="text" color="white" aria-label="Lane Simulators">
                <v-icon icon="mdi-truck" />
            </v-btn>

            <v-btn to="/settings" icon variant="text" color="white" aria-label="Settings">
                <v-icon icon="mdi-cog" />
            </v-btn>

            <!-- <router-link to="/test" class="router-link" v-if="appdata.is_dev">
                            <v-icon title="Test">insert_chart</v-icon>
                            <span class="material-icons">insert_chart</span>
                        </router-link> -->

            <v-btn to="/about" icon variant="text" color="white" aria-label="Information">
                <v-icon icon="mdi-information" />
            </v-btn>

            <v-btn to="/help" icon variant="text" color="white" aria-label="Help">
                <v-icon icon="mdi-help-circle" />
            </v-btn>
        </v-app-bar>

        <v-main>
            <router-view style="font-size: smaller;"></router-view>
            <!-- <v-icon icon="mdi-truck" /> -->
        </v-main>
    </v-app>
</template>

<script lang="ts">
// import HelloWorld from "./components/HelloWorld.vue";
import HomePage from "./components/HomePage.vue";
import { banner } from "./lib/Utility";
import { AppData } from './lib/AppData';
import { useSettingsStore } from "./store/settingsStore";


export default {
    name: "App",
    components: {
        // HelloWorld,
        HomePage,
    },
    data() {
        return {
            appdata: AppData,
            home_component: null,
        };
    },
    methods: {
        on_click_me: function () {
            // console.log("on_click_me", this.$routes);
            // this.$refs["home_page"].say_hello();
        },
    },
    async created() {
        banner(["App.vue.created"]);

        var settings = useSettingsStore();

        try {
            await settings.loadSettings();
            settings.settingsManager?.create_default_lane();
        }
        catch (e) {
            console.error(`App.vue created(), error loading settings ${e}`);
        }

        AppData.is_dev = import.meta.env.DEV;
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
