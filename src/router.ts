import HomePage from "./components/HomePage.vue";
import About from "./views/About.vue";
import Help from "./views/Help.vue";
// import ProfileTest from "components/ProfileTest.vue";
import GlobalSettings from "./components/GlobalSettings.vue";
import { createRouter, createWebHistory, Router, RouteRecordRaw, RouterOptions } from "vue-router";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "Home",
        component: HomePage,
    },
    {
        path: "/about",
        name: "About",
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
    // {
    //     path: "/test",
    //     name: "test",
    //     component: ProfileTest,
    // },
];

const options: RouterOptions = {
    history: createWebHistory(),
    routes,
};

const router: Router = createRouter(options);

export default router;
