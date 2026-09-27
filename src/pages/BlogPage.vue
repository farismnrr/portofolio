<script setup lang="ts">
import blog from "virtual:content/blog";
</script>
<template>
  <section class="page">
    <h1 class="page-title page-title--left">Blog</h1>
    <div class="blog-grid">
      <v-card
        v-for="post in blog"
        :key="post.slug"
        :to="`/blog/${post.slug}`"
        class="blog-card"
        variant="flat"
        color="transparent"
      >
        <v-img
          v-if="post.image"
          class="blog-card__image"
          :src="post.image"
          :alt="post.title"
          eager
          cover
        />
        <div class="blog-card__body">
          <time>{{ post.publishedAt }}</time>
          <h2>{{ post.title }}</h2>
          <p>{{ post.summary }}</p>
          <div class="tag-row">
            <v-chip
              v-for="tag in post.tags"
              :key="tag"
              class="tag"
              size="small"
              variant="plain"
            >
              {{ tag }}
            </v-chip>
          </div>
        </div>
      </v-card>
    </div>
  </section>
</template>
