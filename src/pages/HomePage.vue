<script setup lang="ts">
import about from "virtual:content/about";
import projects from "virtual:content/projects";
import AppIcon from "../components/AppIcon.vue";
import ProjectCard from "../components/ProjectCard.vue";

const featured = projects.slice(0, 3);
</script>

<template>
  <section class="page page--home">
    <div class="hero">
      <div class="eyebrow">Software engineering · AI · IoT</div>
      <h1>Design. <span>Code.</span> Create.</h1>
      <p>I’m {{ about.name }}, a {{ about.role }} specializing in backend, cloud, IoT, and intelligent software systems.</p>
      <div class="hero__actions">
        <v-btn to="/about" color="primary" variant="flat" rounded="xl">
          About me
          <AppIcon name="arrow" :size="16" />
        </v-btn>
        <v-btn to="/projects" variant="outlined" rounded="xl">View projects</v-btn>
      </div>
    </div>
    <div class="section-heading">
      <span>Selected work</span>
      <RouterLink to="/projects">All projects <AppIcon name="arrow" :size="14" /></RouterLink>
    </div>
    <div class="project-list">
      <ProjectCard v-for="(project, index) in featured" :key="project.slug" :project="project" :priority="index < 1" />
    </div>
  </section>
</template>
