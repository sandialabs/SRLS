import Vue from "vue";
import Router from "vue-router";
import GlobalSettings from "./components/GlobalSettings.vue";
import HomePage from "./components/HomePage.vue";
import About from "./views/About.vue";
import Help from "./views/Help.vue";
import ProfileTest from "./components/ProfileTest.vue";

Vue.use(Router);

let router = new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: "/",
            name: "home",
            component: HomePage,
        },
        {
            path: "/about",
            name: "about",
            component: About,
        },
        {
            path: "/settings",
            name: "settings",
            component: GlobalSettings,
        },
        {
            path: "/help",
            name: "help",
            component: Help,
        },
        {
            path: "/test",
            name: "test",
            component: ProfileTest,
        },
    ],
});

export default router;
