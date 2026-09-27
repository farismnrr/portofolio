import { createApp, createSSRApp } from "vue";
import { createWebHistory } from "vue-router";
import App from "./App.vue";
import { createPortfolioVuetify, type ThemeMode } from "./plugins/vuetify";
import { createPortfolioRouter } from "./router";
import "./styles/main.scss";

const app = import.meta.env.DEV ? createApp(App) : createSSRApp(App);
const router = createPortfolioRouter(createWebHistory());
const initialTheme: ThemeMode =
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

app.use(router);
app.use(createPortfolioVuetify(initialTheme));
router.isReady().then(() => app.mount("#app"));
