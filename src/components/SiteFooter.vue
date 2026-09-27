<script setup lang="ts">
import about from "virtual:content/about";
import AppIcon from "./AppIcon.vue";

const year = new Date().getFullYear();
</script>

<template>
  <v-footer
    color="transparent"
    class="site-footer d-flex flex-column flex-sm-row align-start align-sm-center justify-center justify-sm-space-between ga-4 ga-sm-6 px-0"
  >
    <div>© {{ year }} / <strong>{{ about.name }}</strong></div>

    <div class="d-flex align-center ga-1">
      <v-btn
        v-for="item in about.social"
        :key="item.name"
        :href="item.link"
        :aria-label="item.name"
        :target="item.link.startsWith('http') ? '_blank' : undefined"
        rel="noreferrer"
        variant="text"
        icon
        size="small"
        class="text-medium-emphasis"
      >
        <AppIcon :name="item.icon" :size="18" />
      </v-btn>
    </div>
  </v-footer>
</template>
