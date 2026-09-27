<script setup lang="ts">
import gallery from "virtual:content/gallery";
</script>

<template>
  <section class="page page--wide">
    <h1 class="page-title">Gallery</h1>

    <div class="gallery-grid">
      <a
        v-for="image in gallery"
        :key="image.src"
        :href="image.src"
        target="_blank"
        rel="noreferrer"
        class="gallery-item"
      >
        <v-img :src="image.src" :alt="image.alt" cover rounded="lg" />
      </a>
    </div>
  </section>
</template>
