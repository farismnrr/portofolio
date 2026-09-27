<script setup lang="ts">
import type { Project } from "../content/types";
import AppIcon from "./AppIcon.vue";

defineProps<{ project: Project; priority?: boolean }>();
</script>

<template>
  <v-card tag="article" class="project-card" variant="flat" color="transparent">
    <RouterLink :to="`/projects/${project.slug}`" class="project-card__media">
      <img :src="project.images[0]" :alt="project.title" :loading="priority ? 'eager' : 'lazy'" />
    </RouterLink>

    <div class="project-card__body">
      <h2><RouterLink :to="`/projects/${project.slug}`">{{ project.title }}</RouterLink></h2>

      <div class="project-card__copy">
        <div v-if="project.team?.length" class="avatar-stack">
          <img
            v-for="member in project.team.slice(0, 3)"
            :key="member.name"
            :src="member.avatar"
            :alt="member.name"
          />
        </div>

        <p>{{ project.summary }}</p>

        <div class="project-card__actions">
          <v-btn :to="`/projects/${project.slug}`" variant="text" size="small" rounded="xl">
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
          >
            View project
            <AppIcon name="external" :size="15" />
          </v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>
