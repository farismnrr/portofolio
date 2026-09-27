<script setup lang="ts">
import certifications from "virtual:content/certifications";
import { computed } from "vue";

const groups = computed(() => Object.groupBy([...certifications], (item) => item.group));
</script>
<template>
  <section class="page page--wide">
    <h1 class="page-title">Certifications & Achievements</h1>
    <div v-for="(items, group) in groups" :key="group" class="cert-group">
      <h2>{{ String(group).replace(/\b\w/g, c => c.toUpperCase()) }}</h2>
      <div class="cert-grid">
        <v-card
          v-for="item in items"
          :key="item.title"
          class="cert-card"
          :href="item.pdf || item.image"
          target="_blank"
          rel="noreferrer"
          variant="flat"
          color="transparent"
        >
          <v-img
            class="cert-card__image"
            :src="item.image"
            :alt="item.title"
            aspect-ratio="4/3"
            cover
          />
          <span>{{ item.title }}</span>
        </v-card>
      </div>
    </div>
  </section>
</template>
