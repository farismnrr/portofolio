<script setup lang="ts">
import blog from "virtual:content/blog";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const post = computed(() => blog.find((item) => item.slug === route.params.slug));
</script>

<template>
  <section v-if="post" class="page detail-page">
    <div class="detail-hero">
      <v-btn to="/blog" variant="text" size="small" rounded="xl" class="text-none mb-1">
        Blog
      </v-btn>
      <time>{{ post.publishedAt }}</time>
      <h1>{{ post.title }}</h1>
      <p>{{ post.summary }}</p>
    </div>

    <v-img
      v-if="post.image"
      :src="post.image"
      :alt="post.title"
      aspect-ratio="16/9"
      cover
      rounded="lg"
      class="border-sm"
    />

    <article class="prose" v-html="post.html" />
  </section>

  <section v-else class="page empty-state d-flex flex-column align-center justify-center ga-3">
    <h1>Post not found</h1>
    <v-btn to="/blog" variant="outlined" rounded="xl">Back to blog</v-btn>
  </section>
</template>
