<script setup lang="ts">
import about from "virtual:content/about";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import AppIcon from "./AppIcon.vue";

const route = useRoute();
const time = ref("");
const theme = ref<"light" | "dark">("light");
let timer: number | undefined;
const nav = [
  { to: "/about", label: "About", icon: "person" },
  { to: "/projects", label: "Projects", icon: "grid" },
  { to: "/blog", label: "Blog", icon: "book" },
  { to: "/certifications", label: "Certifications", icon: "document" },
  { to: "/gallery", label: "Gallery", icon: "gallery" },
];
const current = computed(() => route.path);
function tick() {
  time.value = new Intl.DateTimeFormat("en-GB", {
    timeZone: about.location,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}
function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme.value;
  localStorage.setItem("theme", theme.value);
}
onMounted(() => {
  theme.value = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  tick();
  timer = window.setInterval(tick, 1000);
});
onUnmounted(() => timer && clearInterval(timer));
</script>

<template>
  <header class="site-header">
    <div class="site-header__edge">{{ about.location }}</div>
    <nav class="nav-pill" aria-label="Primary navigation">
      <RouterLink to="/" class="nav-pill__item nav-pill__home" :class="{ active: current === '/' }" aria-label="Home"><AppIcon name="home" :size="16" /></RouterLink>
      <span class="nav-pill__divider" />
      <RouterLink v-for="item in nav" :key="item.to" :to="item.to" class="nav-pill__item" :class="{ active: current === item.to || current.startsWith(item.to + '/') }">
        <AppIcon :name="item.icon" :size="15" /><span>{{ item.label }}</span>
      </RouterLink>
      <span class="nav-pill__divider" />
      <button class="nav-pill__item nav-pill__home" type="button" :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`" @click="toggleTheme"><AppIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="16" /></button>
    </nav>
    <div class="site-header__edge site-header__edge--right">{{ time }}</div>
  </header>
</template>
