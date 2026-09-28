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

async function mountAgentation() {
  if (window.__PORTFOLIO_RUNTIME__?.agentationEnabled !== true) {
    return;
  }

  const [{ AgentationVue, AgentationVuePlugin }] = await Promise.all([
    import("agentation-vue"),
    import("agentation-vue/style.css"),
  ]);

  const root = document.createElement("div");
  root.id = "agentation-root";
  document.body.appendChild(root);

  const agentationApp = createApp(AgentationVue);
  agentationApp.use(AgentationVuePlugin);
  agentationApp.mount(root);
}

router.isReady().then(async () => {
  app.mount("#app");
  await mountAgentation();
});
