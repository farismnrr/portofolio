<script setup lang="ts">
import gallery from "virtual:content/gallery";
import PageIntro from "../components/PageIntro.vue";
</script>

<template>
  <section class="page page--wide">
    <PageIntro
      eyebrow="Visual archive"
      title="Gallery"
      description="A small collection of product visuals, project moments, and snapshots from things I have built."
    />

    <v-row>
      <v-col v-for="image in gallery" :key="image.src" cols="12" sm="6">
        <v-card
          :href="image.src"
          target="_blank"
          rel="noreferrer"
          variant="outlined"
          rounded="xl"
          class="content-card overflow-hidden"
        >
          <v-img :src="image.src" :alt="image.alt" aspect-ratio="4/3" cover />
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>
