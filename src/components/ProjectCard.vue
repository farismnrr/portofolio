<script setup lang="ts">
import type { Project } from "../content/types";
import AppIcon from "./AppIcon.vue";

defineProps<{ project: Project; priority?: boolean }>();
</script>
<template>
  <article class="project-card">
    <RouterLink :to="`/projects/${project.slug}`" class="project-card__media">
      <v-img
        :src="project.images[0]"
        :alt="project.title"
        :eager="priority"
        aspect-ratio="16/9"
        cover
      />
    </RouterLink>
    <div class="project-card__body">
      <div>
        <h2><RouterLink :to="`/projects/${project.slug}`">{{ project.title }}</RouterLink></h2>
        <div v-if="project.organization || project.role" class="project-card__context">
          <span v-if="project.organization">{{ project.organization }}</span>
          <span v-if="project.organization && project.role" aria-hidden="true">·</span>
          <span v-if="project.role">{{ project.role }}</span>
        </div>
      </div>
      <div class="project-card__copy">
        <div class="avatar-stack" v-if="project.team?.length">
          <v-avatar
            v-for="member in project.team.slice(0, 3)"
            :key="member.name"
            :image="member.avatar"
            :aria-label="member.name"
            size="30"
          />
        </div>
        <p>{{ project.summary }}</p>
        <div class="project-card__actions">
          <RouterLink :to="`/projects/${project.slug}`">Read case study <AppIcon name="arrow" :size="15" /></RouterLink>
          <a v-if="project.link" :href="project.link" target="_blank" rel="noreferrer">View project <AppIcon name="external" :size="15" /></a>
        </div>
      </div>
    </div>
  </article>
</template>
