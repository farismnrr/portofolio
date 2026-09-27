<script setup lang="ts">
import blog from "virtual:content/blog";
</script>

<template>
  <section class="page">
    <h1 class="page-title page-title--left">Blog</h1>

    <div class="d-flex flex-column ga-7">
      <v-card
        v-for="post in blog"
        :key="post.slug"
        :to="`/blog/${post.slug}`"
        variant="outlined"
        rounded="lg"
        class="pa-2"
      >
        <v-row no-gutters align="stretch">
          <v-col cols="12" md="5">
            <v-img
              v-if="post.image"
              :src="post.image"
              :alt="post.title"
              aspect-ratio="16/10"
              cover
              rounded="lg"
              class="h-100"
            />
          </v-col>

          <v-col cols="12" md="7" class="pa-4 pa-md-6">
            <time class="text-caption text-medium-emphasis">{{ post.publishedAt }}</time>
            <h2 class="text-h5 font-weight-medium mt-2 mb-3">{{ post.title }}</h2>
            <p class="text-body-2 text-medium-emphasis mb-4">{{ post.summary }}</p>

            <div class="d-flex flex-wrap ga-2">
              <v-chip v-for="tag in post.tags" :key="tag" size="small" variant="outlined">
                {{ tag }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </div>
  </section>
</template>
