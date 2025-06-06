import { createWebHistory, createRouter } from "vue-router";
import Home from "../components/Home.vue";
// import HomePage from "../components/HomePage.vue";
import About from "../views/About.vue";
import Help from "../views/Help.vue";
import GlobalSettings from "../components/GlobalSettings.vue";

const routes = [
    {
        path: "/home",
        name: "Home",
        component: Home,
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

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;