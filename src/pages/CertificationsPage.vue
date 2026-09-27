<script setup lang="ts">
import certifications from "virtual:content/certifications";
import { computed } from "vue";

const groups = computed(() => Object.groupBy([...certifications], (item) => item.group));
</script>

<template>
  <section class="page page--wide">
    <h1 class="page-title">Certifications & Achievements</h1>

    <div v-for="(items, group) in groups" :key="group" class="cert-group">
      <h2>{{ String(group).replace(/\b\w/g, (c) => c.toUpperCase()) }}</h2>

      <v-row>
        <v-col v-for="item in items" :key="item.title" cols="12" sm="6" md="4">
          <v-card
            :href="item.pdf || item.image"
            target="_blank"
            rel="noreferrer"
            variant="outlined"
            rounded="lg"
            class="cert-card h-100"
          >
            <img :src="item.image" :alt="item.title" loading="lazy" />
            <span>{{ item.title }}</span>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </section>
</template>
