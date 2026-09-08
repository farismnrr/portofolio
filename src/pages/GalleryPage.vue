<script setup lang="ts">
import gallery from "virtual:content/gallery";
</script>
<template><section class="page page--wide"><h1 class="page-title">Gallery</h1><div class="gallery-grid"><a v-for="image in gallery" :key="image.src" :href="image.src" target="_blank" rel="noreferrer"><img :src="image.src" :alt="image.alt" loading="lazy" /></a></div></section></template>
