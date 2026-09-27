import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { portfolioContent } from "./scripts/content-plugin";

export default defineConfig({
  envDir: false,
  plugins: [portfolioContent(), vue()],
  ssr: {
    noExternal: ["vuetify"],
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
  },
});
