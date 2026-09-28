<script setup lang="ts">
import about from "virtual:content/about";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import AppIcon from "./AppIcon.vue";

const route = useRoute();
const theme = ref<"light" | "dark">("light");

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/blog", label: "Blog" },
  { to: "/certifications", label: "Certifications" },
  { to: "/gallery", label: "Gallery" },
];

const current = computed(() => route.path);

function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme.value;
  localStorage.setItem("theme", theme.value);
}

onMounted(() => {
  theme.value = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
});
</script>

<template>
  <header class="site-header">
    <RouterLink to="/" class="site-brand" aria-label="Faris Munir home">
      <v-img
        class="site-brand__logo site-brand__logo--light"
        src="/images/brand/farismnrr-logo.svg"
        alt="farismnrr."
        eager
      />
      <v-img
        class="site-brand__logo site-brand__logo--dark"
        src="/images/brand/farismnrr-logo-dark.svg"
        alt=""
        aria-hidden="true"
        eager
      />
    </RouterLink>

    <nav class="site-nav" aria-label="Primary navigation">
      <v-btn
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        :class="{ active: item.to === '/' ? current === '/' : current === item.to || current.startsWith(item.to + '/') }"
        variant="plain"
        density="compact"
      >
        {{ item.label }}
      </v-btn>
    </nav>

    <div class="site-header__actions">
      <v-btn
        class="site-header__contact"
        :href="`mailto:${about.email}`"
        variant="plain"
        density="compact"
      >
        Contact
      </v-btn>
      <v-btn
        class="site-header__theme"
        :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`"
        variant="plain"
        density="compact"
        icon
        @click="toggleTheme"
      >
        <AppIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="16" />
      </v-btn>
    </div>
  </header>
</template>
