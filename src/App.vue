<script setup lang="ts">
import SiteFooter from "./components/SiteFooter.vue";
import SiteHeader from "./components/SiteHeader.vue";
</script>

<template>
  <v-app>
    <div class="ambient" aria-hidden="true" />
    <SiteHeader />
    <v-main class="site-main">
      <v-container fluid class="pa-0">
        <RouterView />
      </v-container>
    </v-main>
    <SiteFooter />
  </v-app>
</template>
