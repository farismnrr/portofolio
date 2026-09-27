<script setup lang="ts">
import about from "virtual:content/about";
import projects from "virtual:content/projects";
import work from "virtual:content/work";
import AppIcon from "../components/AppIcon.vue";
import type { SocialLink } from "../content/types";

const featuredProjectSlugs = ["sensio-notes", "masih-awam-ai-code", "sensio-iot", "masih-awam-lms"];
const featured = featuredProjectSlugs
  .map((slug) => projects.find((project) => project.slug === slug))
  .filter((project): project is (typeof projects)[number] => Boolean(project));
const recentWork = work.slice(0, 3);
const essentialSocial = about.social.filter((item: SocialLink) => item.essential);

const focusAreas = [
  { label: "Backend systems", icon: "server" },
  { label: "AI & agentic workflows", icon: "bot" },
  { label: "IoT & real-time platforms", icon: "radio" },
  { label: "Cloud, observability & security", icon: "cloud" },
];

const values = [
  {
    icon: "lightbulb",
    title: "Problem solver",
    copy: "Breaking complex problems into practical, maintainable systems.",
  },
  {
    icon: "book",
    title: "Continuous learner",
    copy: "Always exploring better tools, patterns, and ways to build.",
  },
  {
    icon: "target",
    title: "Real-world focus",
    copy: "Building with actual users, data, devices, and constraints in mind.",
  },
  {
    icon: "users",
    title: "Open to collaboration",
    copy: "Happy to work on useful products and difficult engineering problems.",
  },
];

const locationLabel = "Jakarta, Indonesia";
</script>

<template>
  <section class="page page--home">
    <section class="home-hero" aria-labelledby="home-title">
      <div class="home-hero__intro">
        <div class="eyebrow">Software Engineer · AI · IoT · Backend</div>
        <h1 id="home-title">{{ about.firstName }} {{ about.lastName }}</h1>
        <h2>Building <span>useful things</span> with code.</h2>
        <p>{{ about.description }}</p>

        <div class="home-hero__actions">
          <v-btn
            class="button button--primary"
            :href="`mailto:${about.email}`"
            variant="plain"
            density="compact"
          >
            Contact me <AppIcon name="arrow" :size="15" />
          </v-btn>
          <v-btn class="button" to="/projects" variant="plain" density="compact">
            View projects
          </v-btn>
        </div>

        <div class="home-hero__meta">
          <span><AppIcon name="pin" :size="15" /> {{ locationLabel }}</span>
          <span class="availability"><i aria-hidden="true" /> Available for opportunities</span>
        </div>
      </div>

      <div class="home-portrait" aria-label="Portrait">
        <img :src="about.avatar" :alt="about.name" />
        <blockquote class="home-portrait__quote">
          <span aria-hidden="true">“</span>
          <p>Technology is more meaningful when it solves real problems.</p>
        </blockquote>
      </div>

      <aside class="home-focus" aria-label="Professional focus">
        <div>
          <span class="home-focus__label">Focused on</span>
          <ul>
            <li v-for="item in focusAreas" :key="item.label">
              <span class="home-focus__icon"><AppIcon :name="item.icon" :size="16" /></span>
              <span>{{ item.label }}</span>
            </li>
          </ul>
        </div>
        <div class="home-focus__social">
          <span class="home-focus__label">Let's connect</span>
          <div>
            <a
              v-for="item in essentialSocial"
              :key="item.name"
              :href="item.link"
              :aria-label="item.name"
              :target="item.link.startsWith('http') ? '_blank' : undefined"
              rel="noreferrer"
            >
              <AppIcon :name="item.icon" :size="18" />
            </a>
          </div>
        </div>
      </aside>
    </section>

    <section id="experience" class="home-section home-experience">
      <div class="home-section__head">
        <div>
          <div class="eyebrow">Experience</div>
          <h2>Work that shaped how I build.</h2>
        </div>
        <RouterLink to="/about#work-experience">View full experience <AppIcon name="arrow" :size="14" /></RouterLink>
      </div>

      <div class="experience-list">
        <article v-for="item in recentWork" :key="`${item.company}-${item.role}`" class="experience-item">
          <time>{{ item.timeframe }}</time>
          <div class="experience-item__body">
            <h3>{{ item.role }}</h3>
            <div class="experience-item__company">{{ item.company }}</div>
            <p>{{ item.achievements[0] }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="home-section home-projects">
      <div class="home-section__head">
        <div>
          <div class="eyebrow">Selected projects</div>
          <h2>Work that shows how I think.</h2>
        </div>
        <RouterLink to="/projects">View all projects <AppIcon name="arrow" :size="14" /></RouterLink>
      </div>

      <div class="home-project-grid">
        <article v-for="(project, index) in featured" :key="project.slug" class="home-project-card">
          <RouterLink :to="`/projects/${project.slug}`" class="home-project-card__media">
            <img :src="project.images[0]" :alt="project.title" :loading="index === 0 ? 'eager' : 'lazy'" />
          </RouterLink>
          <div class="home-project-card__body">
            <div v-if="project.organization || project.role" class="home-project-card__context">
              <span v-if="project.organization">{{ project.organization }}</span>
              <span v-if="project.organization && project.role" aria-hidden="true">·</span>
              <span v-if="project.role">{{ project.role }}</span>
            </div>
            <div class="home-project-card__title">
              <h3><RouterLink :to="`/projects/${project.slug}`">{{ project.projectName || project.title }}</RouterLink></h3>
              <RouterLink :to="`/projects/${project.slug}`" :aria-label="`Open ${project.title}`"><AppIcon name="arrow" :size="15" /></RouterLink>
            </div>
            <p>{{ project.summary }}</p>
            <div class="home-project-card__tags">
              <v-chip
                v-for="tag in project.tags.slice(0, 3)"
                :key="tag"
                class="home-project-card__tag"
                size="x-small"
                variant="plain"
              >
                {{ tag }}
              </v-chip>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section id="about" class="home-section home-about">
      <div class="home-about__intro">
        <div class="eyebrow">About me</div>
        <h2>More than just code.</h2>
        <p>I care about building software that is maintainable, reliable, and useful in the real world. My work sits across backend engineering, intelligent systems, IoT, and the infrastructure that keeps them running.</p>
        <v-btn class="button" to="/about" variant="plain" density="compact">
          More about me <AppIcon name="arrow" :size="15" />
        </v-btn>
      </div>

      <div class="home-values">
        <article v-for="item in values" :key="item.title">
          <div class="home-values__icon"><AppIcon :name="item.icon" :size="19" /></div>
          <div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.copy }}</p>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>
