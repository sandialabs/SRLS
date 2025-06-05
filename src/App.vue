<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from "./components/HelloWorld.vue";
import { AppData } from "./main";
</script>

<template>
        <v-toolbar app dark color="primary">

            <!-- <v-toolbar-title class="white--text">{{appdata.apptitle}}</v-toolbar-title> -->

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
                <v-icon title="Help">help</v-icon>
            </router-link>
        </v-toolbar>
        <v-content fluid>
            <router-view style="font-size: smaller;"></router-view>
        </v-content>
  <HelloWorld msg="Vite + Vue 3 + Electron + TypeScript" />
  <br />
  <p class="plugins">Plugins</p>
  <img alt="vue router logo" width="120" src="./assets/vueRouter.png" />
  <img alt="pinia logo" width="120" src="./assets/pinia.svg" />
</template>

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
