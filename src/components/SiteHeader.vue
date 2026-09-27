<script setup lang="ts">
import about from "virtual:content/about";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useTheme } from "vuetify";
import type { ThemeMode } from "../plugins/vuetify";
import AppIcon from "./AppIcon.vue";

const route = useRoute();
const vuetifyTheme = useTheme();
const time = ref("");
const theme = ref<ThemeMode>("light");
let timer: number | undefined;

const nav = [
  { to: "/about", label: "About", icon: "person" },
  { to: "/projects", label: "Projects", icon: "grid" },
  { to: "/blog", label: "Blog", icon: "book" },
  { to: "/certifications", label: "Certifications", icon: "document" },
  { to: "/gallery", label: "Gallery", icon: "gallery" },
];

const current = computed(() => route.path);

function isActive(path: string) {
  return current.value === path || current.value.startsWith(`${path}/`);
}

function tick() {
  time.value = new Intl.DateTimeFormat("en-GB", {
    timeZone: about.location,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function applyTheme(next: ThemeMode) {
  theme.value = next;
  document.documentElement.dataset.theme = next;
  document.documentElement.classList.remove("v-theme--light", "v-theme--dark");
  document.documentElement.classList.add(`v-theme--${next}`);
  vuetifyTheme.global.name.value = next;
}

function toggleTheme() {
  const next: ThemeMode = theme.value === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("theme", next);
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

    <v-sheet
      tag="nav"
      class="nav-pill d-flex align-center ga-1 pa-1"
      aria-label="Primary navigation"
      rounded="pill"
      border
      elevation="4"
    >
      <v-btn
        to="/"
        :variant="current === '/' ? 'tonal' : 'text'"
        rounded="xl"
        size="small"
        icon
        aria-label="Home"
      >
        <AppIcon name="home" :size="16" />
      </v-btn>

      <v-divider vertical class="mx-1" />

      <v-btn
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        :variant="isActive(item.to) ? 'tonal' : 'text'"
        rounded="xl"
        size="small"
        class="text-none px-2 px-md-3"
      >
        <AppIcon :name="item.icon" :size="15" />
        <span class="d-none d-md-inline">{{ item.label }}</span>
      </v-btn>

      <v-divider vertical class="mx-1" />

      <v-btn
        variant="text"
        rounded="xl"
        size="small"
        icon
        :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
        @click="toggleTheme"
      >
        <AppIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="16" />
      </v-btn>
    </v-sheet>

    <div class="site-header__edge site-header__edge--right">{{ time }}</div>
  </header>
</template>
