<script setup lang="ts">
import about from "virtual:content/about";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useTheme } from "vuetify";
import type { ThemeMode } from "../plugins/vuetify";
import AppIcon from "./AppIcon.vue";

const route = useRoute();
const vuetifyTheme = useTheme();
const theme = ref<ThemeMode>("light");

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/blog", label: "Blog" },
  { to: "/certifications", label: "Certifications" },
  { to: "/gallery", label: "Gallery" },
];

const current = computed(() => route.path);

function isActive(path: string) {
  if (path === "/") return current.value === "/";
  return current.value === path || current.value.startsWith(`${path}/`);
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
});
</script>

<template>
  <header class="site-header">
    <v-container class="site-header__inner d-flex align-center px-4 px-md-6" fluid>
      <RouterLink to="/" class="site-brand" aria-label="Faris Munir Mahdi home">
        farismnrr<span>.</span>
      </RouterLink>

      <nav class="site-nav d-none d-lg-flex align-center justify-center ga-1" aria-label="Primary navigation">
        <v-btn
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          variant="text"
          size="small"
          rounded="lg"
          class="site-nav__item text-none"
          :class="{ 'site-nav__item--active': isActive(item.to) }"
        >
          {{ item.label }}
        </v-btn>
      </nav>

      <div class="site-header__actions d-flex align-center justify-end ga-2">
        <v-btn
          :href="`mailto:${about.email}`"
          variant="outlined"
          rounded="xl"
          size="small"
          class="text-none d-none d-sm-inline-flex"
        >
          Contact
        </v-btn>

        <v-btn
          variant="outlined"
          rounded="circle"
          size="small"
          icon
          :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
          @click="toggleTheme"
        >
          <AppIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="17" />
        </v-btn>
      </div>
    </v-container>
  </header>
</template>
