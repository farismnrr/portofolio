<script setup lang="ts">
import about from "virtual:content/about";
import projects from "virtual:content/projects";
import ProjectCard from "../components/ProjectCard.vue";
</script>
<template>
  <section class="page page--wide"><h1 class="page-title">Projects — {{ about.name }}</h1><div class="project-list"><ProjectCard v-for="(project, index) in projects" :key="project.slug" :project="project" :priority="index < 2" /></div></section>
</template>
