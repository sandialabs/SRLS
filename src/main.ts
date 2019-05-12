import Vue from "vue";
import "./plugins/vuetify";
import App from "./App.vue";
import router from "./router";
import { SettingsManager } from "./lib/settings";
import { ProfileGenerator2 } from "./lib/ProfileGenerator2";
import { RPMSimulator } from "./lib/RPMSimulator";

Vue.config.productionTip = false;

export let AppData = {
    apptitle: "RPM Simulator",
    settings: new SettingsManager("settings.json"),
    testsim: new RPMSimulator("127.0.0.1", 1600, "Test Simulator", new ProfileGenerator2()),
};

console.log("Settings: ", AppData.settings.Data);

if (AppData.settings.Data.Lanes.length == 0) {
    AppData.settings.add_lane("Lane 1", "127.0.0.1", 1601);
    AppData.settings.save();
}

new Vue({
    router,
    render: h => h(App),
}).$mount("#app");
