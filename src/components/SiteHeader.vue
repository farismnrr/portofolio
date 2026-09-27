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
    <nav class="nav-pill" aria-label="Primary navigation">
      <v-btn
        to="/"
        class="nav-pill__item nav-pill__home"
        :class="{ active: current === '/' }"
        variant="text"
        rounded="xl"
        size="small"
        aria-label="Home"
      >
        <AppIcon name="home" :size="16" />
      </v-btn>
      <span class="nav-pill__divider" />
      <v-btn
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        class="nav-pill__item"
        :class="{ active: current === item.to || current.startsWith(item.to + '/') }"
        variant="text"
        rounded="xl"
        size="small"
      >
        <AppIcon :name="item.icon" :size="15" />
        <span>{{ item.label }}</span>
      </v-btn>
      <span class="nav-pill__divider" />
      <v-btn
        class="nav-pill__item nav-pill__home"
        variant="text"
        rounded="xl"
        size="small"
        :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
        @click="toggleTheme"
      >
        <AppIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="16" />
      </v-btn>
    </nav>
    <div class="site-header__edge site-header__edge--right">{{ time }}</div>
  </header>
</template>
