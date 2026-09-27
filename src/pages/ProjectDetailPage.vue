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
    <div class="detail-hero"><RouterLink to="/projects" class="back-link">Projects</RouterLink><time>{{ formatted }}</time><h1>{{ project.title }}</h1><div v-if="project.organization || project.role" class="detail-project-context"><span v-if="project.organization">{{ project.organization }}</span><span v-if="project.organization && project.role" aria-hidden="true">·</span><span v-if="project.role">{{ project.role }}</span></div><p>{{ project.summary }}</p></div>
    <div class="detail-team" v-if="project.team?.length"><div class="avatar-stack"><img v-for="member in project.team" :key="member.name" :src="member.avatar" :alt="member.name" /></div><span>{{ project.team.map((m: ProjectMember) => m.name).join(', ') }}</span></div>
    <div class="detail-actions"><a v-if="project.link" class="button button--primary" :href="project.link" target="_blank" rel="noreferrer">Visit live project <AppIcon name="external" :size="16" /></a><a v-if="project.repository" class="button" :href="project.repository" target="_blank" rel="noreferrer">View code <AppIcon name="github" :size="16" /></a></div>
    <img v-if="project.images?.[0]" class="detail-cover" :src="project.images[0]" :alt="project.title" />
    <article class="prose" v-html="project.html" />
  </section>
  <section v-else class="page empty-state"><h1>Project not found</h1><RouterLink to="/projects">Back to projects</RouterLink></section>
</template>
