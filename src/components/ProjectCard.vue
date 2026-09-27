<script setup lang="ts">
import type { Project } from "../content/types";
import AppIcon from "./AppIcon.vue";

defineProps<{ project: Project; priority?: boolean }>();
</script>

<template>
  <v-card tag="article" class="project-card" variant="flat" color="transparent">
    <RouterLink :to="`/projects/${project.slug}`" class="project-card__media">
      <v-img
        :src="project.images[0]"
        :alt="project.title"
        :eager="priority"
        aspect-ratio="16/9"
        cover
        rounded="lg"
        class="project-card__image"
      />
    </RouterLink>

    <v-row class="pt-4 pt-md-5" align="start">
      <v-col cols="12" md="5">
        <h2>
          <RouterLink :to="`/projects/${project.slug}`">{{ project.title }}</RouterLink>
        </h2>
      </v-col>

      <v-col cols="12" md="7" class="project-card__copy">
        <div v-if="project.team?.length" class="avatar-stack">
          <v-avatar
            v-for="member in project.team.slice(0, 3)"
            :key="member.name"
            :image="member.avatar"
            :aria-label="member.name"
            size="30"
          />
        </div>

        <p>{{ project.summary }}</p>

        <div class="d-flex flex-wrap ga-2">
          <v-btn :to="`/projects/${project.slug}`" variant="text" size="small" rounded="xl" class="text-none">
            Read case study
            <AppIcon name="arrow" :size="15" />
          </v-btn>

          <v-btn
            v-if="project.link"
            :href="project.link"
            target="_blank"
            rel="noreferrer"
            variant="text"
            size="small"
            rounded="xl"
            class="text-none"
          >
            View project
            <AppIcon name="external" :size="15" />
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>
