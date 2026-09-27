<script setup lang="ts">
import about from "virtual:content/about";
import AppIcon from "./AppIcon.vue";

const year = new Date().getFullYear();
</script>
<template>
  <footer class="site-footer">
    <div>© {{ year }} / <strong>{{ about.name }}</strong></div>
    <div class="site-footer__links">
      <v-btn
        v-for="item in about.social"
        :key="item.name"
        class="site-footer__link"
        :href="item.link"
        :aria-label="item.name"
        :target="item.link.startsWith('http') ? '_blank' : undefined"
        rel="noreferrer"
        variant="plain"
        density="compact"
        icon
      >
        <AppIcon :name="item.icon" :size="18" />
      </v-btn>
    </div>
  </footer>
</template>
