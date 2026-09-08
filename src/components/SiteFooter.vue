<script setup lang="ts">
import about from "virtual:content/about";
import AppIcon from "./AppIcon.vue";

const year = new Date().getFullYear();
</script>
<template>
  <footer class="site-footer">
    <div>© {{ year }} / <strong>{{ about.name }}</strong></div>
    <div class="site-footer__links">
      <a v-for="item in about.social" :key="item.name" :href="item.link" :aria-label="item.name" :target="item.link.startsWith('http') ? '_blank' : undefined" rel="noreferrer"><AppIcon :name="item.icon" :size="18" /></a>
    </div>
  </footer>
</template>
