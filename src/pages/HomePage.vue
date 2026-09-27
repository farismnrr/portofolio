<script setup lang="ts">
import about from "virtual:content/about";
import projects from "virtual:content/projects";
import AppIcon from "../components/AppIcon.vue";
import ProjectCard from "../components/ProjectCard.vue";

const featured = projects.slice(0, 3);
const focusAreas = [
  { icon: "server", label: "Backend systems" },
  { icon: "bot", label: "AI & agentic workflows" },
  { icon: "signal", label: "IoT & real-time platforms" },
  { icon: "cloud", label: "Cloud, observability & security" },
];
</script>

<template>
  <section class="page home-page">
    <v-row class="home-hero ma-0" align="center">
      <v-col cols="12" lg="5" class="home-hero__copy pa-0 pe-lg-10">
        <div class="home-kicker">Software engineer · AI · IoT · Backend</div>

        <h1 class="home-title">
          {{ about.firstName }} {{ about.lastName }}
        </h1>

        <h2 class="home-tagline">
          Building <span>useful things</span> with code.
        </h2>

        <p class="home-description">
          {{ about.description }}
        </p>

        <div class="d-flex flex-wrap ga-3 mt-7">
          <v-btn
            :href="`mailto:${about.email}`"
            color="primary"
            variant="flat"
            rounded="xl"
            size="large"
            class="text-none"
          >
            Contact me
            <AppIcon name="arrow" :size="16" />
          </v-btn>
          <v-btn to="/projects" variant="outlined" rounded="xl" size="large" class="text-none">
            View projects
          </v-btn>
        </div>

        <div class="home-meta d-flex flex-wrap align-center ga-5 mt-7">
          <span class="d-inline-flex align-center ga-2">
            <AppIcon name="pin" :size="16" />
            Jakarta, Indonesia
          </span>
          <span class="d-inline-flex align-center ga-2 home-availability">
            <i aria-hidden="true" />
            Available for opportunities
          </span>
        </div>
      </v-col>

      <v-col cols="12" md="7" lg="4" class="home-portrait-col pa-0 mt-10 mt-lg-0">
        <div class="home-portrait-wrap">
          <v-img
            :src="about.avatar"
            :alt="`${about.name} portrait`"
            cover
            class="home-portrait"
          />
          <v-card class="home-quote pa-4 pa-md-5" rounded="xl" border elevation="0">
            <AppIcon name="quote" :size="20" />
            <p>Technology is more meaningful when it solves real problems.</p>
          </v-card>
        </div>
      </v-col>

      <v-col cols="12" lg="3" class="home-focus pa-0 ps-lg-10 mt-12 mt-lg-0">
        <div class="home-panel-label">Focused on</div>
        <v-list bg-color="transparent" class="home-focus-list pa-0">
          <v-list-item
            v-for="item in focusAreas"
            :key="item.label"
            class="home-focus-item px-0"
          >
            <template #prepend>
              <v-avatar size="34" rounded="lg" color="surface" class="me-3">
                <AppIcon :name="item.icon" :size="18" />
              </v-avatar>
            </template>
            <v-list-item-title>{{ item.label }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <div class="home-connect">
          <div class="home-panel-label">Let's connect</div>
          <div class="d-flex align-center ga-2 mt-4">
            <v-btn
              v-for="item in about.social"
              :key="item.name"
              :href="item.link"
              :aria-label="item.name"
              :target="item.link.startsWith('http') ? '_blank' : undefined"
              rel="noreferrer"
              variant="outlined"
              rounded="circle"
              size="small"
              icon
            >
              <AppIcon :name="item.icon" :size="18" />
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <div class="home-divider" />

    <div class="section-heading">
      <span>Selected work</span>
      <v-btn to="/projects" variant="text" size="small" rounded="xl" class="text-none px-2">
        All projects
        <AppIcon name="arrow" :size="14" />
      </v-btn>
    </div>

    <div class="project-list d-flex flex-column">
      <ProjectCard
        v-for="(project, index) in featured"
        :key="project.slug"
        :project="project"
        :priority="index < 1"
      />
    </div>
  </section>
</template>
