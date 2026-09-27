<script setup lang="ts">
import certifications from "virtual:content/certifications";
import { computed } from "vue";
import PageIntro from "../components/PageIntro.vue";

const groups = computed(() => Object.groupBy([...certifications], (item) => item.group));
</script>

<template>
  <section class="page page--wide">
    <PageIntro
      eyebrow="Credentials"
      title="Certifications & achievements"
      description="Selected certifications, recognitions, and proof of work from the technologies and communities I spend time with."
    />

    <section v-for="(items, group) in groups" :key="group" class="content-section">
      <div class="section-heading">
        <span>{{ String(group).replace(/\b\w/g, (c) => c.toUpperCase()) }}</span>
      </div>

      <v-row>
        <v-col v-for="item in items" :key="item.title" cols="12" sm="6" md="4">
          <v-card
            :href="item.pdf || item.image"
            target="_blank"
            rel="noreferrer"
            variant="outlined"
            rounded="xl"
            class="content-card h-100 overflow-hidden"
          >
            <v-img :src="item.image" :alt="item.title" aspect-ratio="4/3" cover />
            <div class="pa-5">
              <div class="content-card__eyebrow">Credential</div>
              <h2 class="content-card__title content-card__title--small">{{ item.title }}</h2>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </section>
  </section>
</template>
