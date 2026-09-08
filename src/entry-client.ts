import { createApp, createSSRApp } from "vue";
import { createWebHistory } from "vue-router";
import App from "./App.vue";
import { createPortfolioRouter } from "./router";
import "./styles/main.scss";

const app = import.meta.env.DEV ? createApp(App) : createSSRApp(App);
const router = createPortfolioRouter(createWebHistory());
app.use(router);
router.isReady().then(() => app.mount("#app"));
