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
    <div class="about-grid">
      <aside class="profile-rail">
        <img class="profile-avatar" :src="about.avatar" :alt="about.name" />
        <div class="profile-location"><AppIcon name="globe" :size="17" /> {{ about.location }}</div>
        <div class="tag-row"><span v-for="language in about.languages" :key="language" class="tag">{{ language }}</span></div>
      </aside>
      <div class="about-main">
        <section id="introduction" class="about-intro">
          <h1>{{ about.name }}</h1>
          <div class="about-role">{{ about.role }}</div>
          <div class="social-actions">
            <a v-for="item in about.social" :key="item.name" class="chip-button" :href="item.link" :target="item.link.startsWith('http') ? '_blank' : undefined" rel="noreferrer"><AppIcon :name="item.icon" :size="15" />{{ item.name }}</a>
            <button class="chip-button" type="button" @click="printPage"><AppIcon name="download" :size="15" />Save to PDF</button>
          </div>
          <p class="lead">{{ about.description }}</p>
        </section>

        <section id="work-experience" class="resume-section">
          <h2>Work Experience</h2>
          <article v-for="item in work" :key="`${item.company}-${item.role}`" class="resume-item">
            <div class="resume-item__head"><div><h3>{{ item.company }}</h3><span class="accent-text">{{ item.role }}</span></div><time>{{ item.timeframe }}</time></div>
            <ul><li v-for="achievement in item.achievements" :key="achievement">{{ achievement }}</li></ul>
          </article>
        </section>

        <section id="studies" class="resume-section">
          <h2>Studies</h2>
          <article v-for="item in studies" :key="item.institution" class="resume-item resume-item--compact">
            <div class="resume-item__head"><div><h3>{{ item.institution }}</h3><span class="accent-text">{{ item.degree }}</span></div><time>{{ item.period }}</time></div>
            <div class="rich-copy" v-html="item.descriptionHtml" />
          </article>
        </section>

        <section id="technical-skills" class="resume-section">
          <h2>Technical skills</h2>
          <article v-for="item in skills" :key="item.title" class="resume-item resume-item--compact">
            <h3>{{ item.title }}</h3>
            <div class="rich-copy" v-html="item.descriptionHtml" />
            <div class="tag-row"><span v-for="tag in item.tags" :key="tag.name" class="tag">{{ tag.name }}</span></div>
          </article>
        </section>
      </div>
    </div>
  </section>
</template>
