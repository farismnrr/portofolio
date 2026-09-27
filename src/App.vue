<script setup lang="ts">
import SiteFooter from "./components/SiteFooter.vue";
import SiteHeader from "./components/SiteHeader.vue";
</script>

<template>
  <v-app class="site-shell">
    <div class="ambient" aria-hidden="true" />
    <SiteHeader />
    <main class="site-main"><RouterView /></main>
    <SiteFooter />
  </v-app>
</template>
