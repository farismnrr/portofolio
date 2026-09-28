<script setup lang="ts">
import gallery from "virtual:content/gallery";
</script>
<template>
  <section class="page page--wide">
    <h1 class="page-title">Gallery</h1>
    <div class="gallery-grid">
      <v-card
        v-for="image in gallery"
        :key="image.src"
        class="gallery-card"
        :href="image.src"
        target="_blank"
        rel="noreferrer"
        variant="flat"
        color="transparent"
      >
        <v-img
          class="gallery-card__image"
          :src="image.src"
          :alt="image.alt"
          eager
        />
      </v-card>
    </div>
  </section>
</template>
