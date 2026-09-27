<script setup lang="ts">
import blog from "virtual:content/blog";
</script>

<template>
  <section class="page">
    <h1 class="page-title page-title--left">Blog</h1>
    <div class="blog-grid">
      <RouterLink v-for="post in blog" :key="post.slug" :to="`/blog/${post.slug}`" class="blog-card">
        <img v-if="post.image" :src="post.image" :alt="post.title" />
        <div>
          <time>{{ post.publishedAt }}</time>
          <h2>{{ post.title }}</h2>
          <p>{{ post.summary }}</p>
          <div class="tag-row">
            <v-chip v-for="tag in post.tags" :key="tag" size="small" variant="outlined">{{ tag }}</v-chip>
          </div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
