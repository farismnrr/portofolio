<script setup lang="ts">
import projects from "virtual:content/projects";
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppIcon from "../components/AppIcon.vue";
import type { ProjectMember } from "../content/types";

const route = useRoute();
const project = computed(() => projects.find((item) => item.slug === route.params.slug));
const formatted = computed(() =>
  project.value?.publishedAt
    ? new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
        new Date(project.value.publishedAt),
      )
    : "",
);
</script>

<template>
  <section v-if="project" class="page detail-page">
    <div class="detail-hero">
      <RouterLink to="/projects" class="back-link">Projects</RouterLink>
      <time>{{ formatted }}</time>
      <h1>{{ project.title }}</h1>
      <p>{{ project.summary }}</p>
    </div>

    <div v-if="project.team?.length" class="d-flex justify-center align-center ga-3 mb-5 detail-team">
      <div class="avatar-stack">
        <img v-for="member in project.team" :key="member.name" :src="member.avatar" :alt="member.name" />
      </div>
      <span>{{ project.team.map((m: ProjectMember) => m.name).join(", ") }}</span>
    </div>

    <div class="d-flex justify-center flex-wrap ga-2 mb-8">
      <v-btn
        v-if="project.link"
        :href="project.link"
        target="_blank"
        rel="noreferrer"
        color="primary"
        variant="flat"
        rounded="xl"
      >
        Visit live project
        <AppIcon name="external" :size="16" />
      </v-btn>
      <v-btn
        v-if="project.repository"
        :href="project.repository"
        target="_blank"
        rel="noreferrer"
        variant="outlined"
        rounded="xl"
      >
        View code
        <AppIcon name="github" :size="16" />
      </v-btn>
    </div>

    <img v-if="project.images?.[0]" class="detail-cover" :src="project.images[0]" :alt="project.title" />
    <article class="prose" v-html="project.html" />
  </section>

  <section v-else class="page empty-state">
    <h1>Project not found</h1>
    <v-btn to="/projects" variant="outlined" rounded="xl">Back to projects</v-btn>
  </section>
</template>
