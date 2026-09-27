<script setup lang="ts">
import projects from "virtual:content/projects";
import PageIntro from "../components/PageIntro.vue";
import ProjectCard from "../components/ProjectCard.vue";
</script>

<template>
  <section class="page page--wide">
    <PageIntro
      eyebrow="Selected work"
      title="Projects"
      description="A selection of systems, products, and experiments across backend engineering, IoT, cloud infrastructure, and applied AI."
    />

    <div class="project-list d-flex flex-column">
      <ProjectCard
        v-for="(project, index) in projects"
        :key="project.slug"
        :project="project"
        :priority="index < 2"
      />
    </div>
  </section>
</template>
