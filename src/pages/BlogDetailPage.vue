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
      <RouterLink to="/blog" class="back-link">Blog</RouterLink>
      <time>{{ post.publishedAt }}</time>
      <h1>{{ post.title }}</h1>
      <p>{{ post.summary }}</p>
    </div>
    <v-img
      v-if="post.image"
      class="detail-cover"
      :src="post.image"
      :alt="post.title"
      aspect-ratio="16/9"
      eager
      cover
    />
    <article class="prose" v-html="post.html" />
  </section>
  <section v-else class="page empty-state">
    <h1>Post not found</h1>
    <RouterLink to="/blog">Back to blog</RouterLink>
  </section>
</template>
