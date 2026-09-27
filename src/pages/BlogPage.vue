<script setup lang="ts">
import blog from "virtual:content/blog";
import PageIntro from "../components/PageIntro.vue";
</script>

<template>
  <section class="page page--wide">
    <PageIntro
      eyebrow="Notes & ideas"
      title="Blog"
      description="Writing about engineering decisions, building connected systems, and lessons from shipping real software."
    />

    <v-row>
      <v-col v-for="post in blog" :key="post.slug" cols="12" md="6">
        <v-card
          :to="`/blog/${post.slug}`"
          variant="outlined"
          rounded="xl"
          class="content-card h-100 overflow-hidden"
        >
          <v-img
            v-if="post.image"
            :src="post.image"
            :alt="post.title"
            aspect-ratio="16/10"
            cover
          />

          <div class="pa-5 pa-md-6">
            <div class="content-card__eyebrow">{{ post.publishedAt }}</div>
            <h2 class="content-card__title">{{ post.title }}</h2>
            <p class="content-card__copy">{{ post.summary }}</p>

            <div class="d-flex flex-wrap ga-2 mt-5">
              <v-chip v-for="tag in post.tags" :key="tag" size="small" variant="outlined">
                {{ tag }}
              </v-chip>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>
