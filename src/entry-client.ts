import { createApp, createSSRApp } from "vue";
import { createWebHistory } from "vue-router";
import App from "./App.vue";
import { createPortfolioVuetify } from "./plugins/vuetify";
import { createPortfolioRouter } from "./router";
import "./styles/main.scss";

const app = import.meta.env.DEV ? createApp(App) : createSSRApp(App);
const router = createPortfolioRouter(createWebHistory());
const vuetify = createPortfolioVuetify();
app.use(router);
app.use(vuetify);
router.isReady().then(() => app.mount("#app"));
