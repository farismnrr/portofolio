<script setup lang="ts">
import certifications from "virtual:content/certifications";
import { computed } from "vue";

const groups = computed(() => Object.groupBy([...certifications], (item) => item.group));
</script>

<template>
  <section class="page page--wide">
    <h1 class="page-title">Certifications & Achievements</h1>

    <div v-for="(items, group) in groups" :key="group" class="mb-12">
      <h2 class="text-h5 font-weight-medium mb-5">
        {{ String(group).replace(/\b\w/g, (c) => c.toUpperCase()) }}
      </h2>

      <v-row>
        <v-col v-for="item in items" :key="item.title" cols="12" sm="6" md="4">
          <v-card
            :href="item.pdf || item.image"
            target="_blank"
            rel="noreferrer"
            variant="outlined"
            rounded="lg"
            class="h-100 overflow-hidden"
          >
            <v-img :src="item.image" :alt="item.title" aspect-ratio="4/3" cover />
            <div class="pa-4 text-body-2">{{ item.title }}</div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </section>
</template>
