<script setup lang="ts">
import about from "virtual:content/about";
import skills from "virtual:content/skills";
import studies from "virtual:content/studies";
import work from "virtual:content/work";
import AppIcon from "../components/AppIcon.vue";

const sections = [
  { id: "introduction", label: "Introduction" },
  { id: "work-experience", label: "Work Experience" },
  { id: "studies", label: "Studies" },
  { id: "technical-skills", label: "Technical skills" },
];

function printPage() {
  if (typeof window !== "undefined") window.print();
}
</script>

<template>
  <section class="about-page page">
    <aside class="about-toc" aria-label="About sections">
      <a v-for="section in sections" :key="section.id" :href="`#${section.id}`"><span />{{ section.label }}</a>
    </aside>

    <v-row align="start">
      <v-col cols="12" md="3">
        <aside class="profile-rail d-flex flex-row flex-md-column align-start align-md-center flex-wrap ga-4">
          <img class="profile-avatar" :src="about.avatar" :alt="about.name" />
          <div class="profile-location d-flex align-center ga-2">
            <AppIcon name="globe" :size="17" />
            {{ about.location }}
          </div>
          <div class="d-flex flex-wrap ga-2">
            <v-chip v-for="language in about.languages" :key="language" size="small" variant="outlined">
              {{ language }}
            </v-chip>
          </div>
        </aside>
      </v-col>

      <v-col cols="12" md="9" class="about-main">
        <section id="introduction" class="about-intro">
          <h1>{{ about.name }}</h1>
          <div class="about-role">{{ about.role }}</div>

          <div class="about-actions d-flex flex-wrap ga-2 mt-5 mb-7">
            <v-btn
              v-for="item in about.social"
              :key="item.name"
              :href="item.link"
              :target="item.link.startsWith('http') ? '_blank' : undefined"
              rel="noreferrer"
              size="small"
              variant="outlined"
              rounded="xl"
            >
              <AppIcon :name="item.icon" :size="15" />
              {{ item.name }}
            </v-btn>
            <v-btn size="small" variant="outlined" rounded="xl" @click="printPage">
              <AppIcon name="download" :size="15" />
              Save to PDF
            </v-btn>
          </div>

          <p class="lead">{{ about.description }}</p>
        </section>

        <section id="work-experience" class="resume-section">
          <h2>Work Experience</h2>
          <article v-for="item in work" :key="`${item.company}-${item.role}`" class="resume-item">
            <div class="d-flex flex-column flex-md-row justify-space-between align-start ga-1">
              <div>
                <h3>{{ item.company }}</h3>
                <span class="accent-text">{{ item.role }}</span>
              </div>
              <time>{{ item.timeframe }}</time>
            </div>
            <ul><li v-for="achievement in item.achievements" :key="achievement">{{ achievement }}</li></ul>
          </article>
        </section>

        <section id="studies" class="resume-section">
          <h2>Studies</h2>
          <article v-for="item in studies" :key="item.institution" class="resume-item resume-item--compact">
            <div class="d-flex flex-column flex-md-row justify-space-between align-start ga-1">
              <div>
                <h3>{{ item.institution }}</h3>
                <span class="accent-text">{{ item.degree }}</span>
              </div>
              <time>{{ item.period }}</time>
            </div>
            <div class="rich-copy" v-html="item.descriptionHtml" />
          </article>
        </section>

        <section id="technical-skills" class="resume-section">
          <h2>Technical skills</h2>
          <article v-for="item in skills" :key="item.title" class="resume-item resume-item--compact">
            <h3>{{ item.title }}</h3>
            <div class="rich-copy" v-html="item.descriptionHtml" />
            <div class="d-flex flex-wrap ga-2">
              <v-chip v-for="tag in item.tags" :key="tag.name" size="small" variant="outlined">
                {{ tag.name }}
              </v-chip>
            </div>
          </article>
        </section>
      </v-col>
    </v-row>
  </section>
</template>
