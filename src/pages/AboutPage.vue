<script setup lang="ts">
import about from "virtual:content/about";
import skills from "virtual:content/skills";
import studies from "virtual:content/studies";
import work from "virtual:content/work";
import AppIcon from "../components/AppIcon.vue";
import PageIntro from "../components/PageIntro.vue";

function printPage() {
  if (typeof window !== "undefined") window.print();
}
</script>

<template>
  <section class="page page--wide">
    <PageIntro eyebrow="About" :title="about.name" :description="about.description">
      <template #actions>
        <v-btn
          v-for="item in about.social"
          :key="item.name"
          :href="item.link"
          :target="item.link.startsWith('http') ? '_blank' : undefined"
          rel="noreferrer"
          variant="outlined"
          rounded="xl"
          class="text-none"
        >
          <AppIcon :name="item.icon" :size="16" />
          {{ item.name }}
        </v-btn>

        <v-btn variant="outlined" rounded="xl" class="text-none" @click="printPage">
          <AppIcon name="download" :size="16" />
          Save to PDF
        </v-btn>
      </template>
    </PageIntro>

    <v-row class="about-overview" align="stretch">
      <v-col cols="12" md="4">
        <v-card variant="outlined" rounded="xl" class="content-card pa-5 pa-md-6 h-100">
          <div class="d-flex flex-column align-start ga-5">
            <v-avatar size="112" rounded="xl">
              <v-img :src="about.avatar" :alt="about.name" cover />
            </v-avatar>

            <div>
              <div class="content-card__eyebrow">Role</div>
              <div class="text-h6 mt-1">{{ about.role }}</div>
            </div>

            <div>
              <div class="content-card__eyebrow">Location</div>
              <div class="d-flex align-center ga-2 mt-1">
                <AppIcon name="globe" :size="16" />
                {{ about.location }}
              </div>
            </div>

            <div>
              <div class="content-card__eyebrow">Languages</div>
              <div class="d-flex flex-wrap ga-2 mt-2">
                <v-chip v-for="language in about.languages" :key="language" size="small" variant="outlined">
                  {{ language }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card variant="outlined" rounded="xl" class="content-card pa-5 pa-md-7 h-100">
          <div class="content-card__eyebrow">Current focus</div>
          <h2 class="about-focus-title">Engineering reliable systems that connect software, infrastructure, and real-world devices.</h2>
          <p class="content-card__copy mt-4">
            I care about systems that are understandable, observable, secure, and useful after the demo is over.
          </p>
        </v-card>
      </v-col>
    </v-row>

    <section class="content-section">
      <div class="section-heading"><span>Work experience</span></div>
      <v-card variant="outlined" rounded="xl" class="content-card">
        <v-list bg-color="transparent" lines="three" class="pa-0">
          <template v-for="(item, index) in work" :key="`${item.company}-${item.role}`">
            <v-list-item class="pa-5 pa-md-6">
              <div class="d-flex flex-column flex-md-row justify-space-between align-start ga-2">
                <div>
                  <div class="content-card__eyebrow">{{ item.role }}</div>
                  <h3 class="text-h6 mt-1">{{ item.company }}</h3>
                </div>
                <time class="text-caption text-medium-emphasis">{{ item.timeframe }}</time>
              </div>
              <ul class="about-list">
                <li v-for="achievement in item.achievements" :key="achievement">{{ achievement }}</li>
              </ul>
            </v-list-item>
            <v-divider v-if="index < work.length - 1" />
          </template>
        </v-list>
      </v-card>
    </section>

    <section class="content-section">
      <div class="section-heading"><span>Studies</span></div>
      <v-row>
        <v-col v-for="item in studies" :key="item.institution" cols="12" md="6">
          <v-card variant="outlined" rounded="xl" class="content-card pa-5 pa-md-6 h-100">
            <div class="content-card__eyebrow">{{ item.period }}</div>
            <h3 class="content-card__title">{{ item.institution }}</h3>
            <div class="accent-text mt-2">{{ item.degree }}</div>
            <div class="rich-copy mt-4" v-html="item.descriptionHtml" />
          </v-card>
        </v-col>
      </v-row>
    </section>

    <section class="content-section">
      <div class="section-heading"><span>Technical skills</span></div>
      <v-row>
        <v-col v-for="item in skills" :key="item.title" cols="12" md="6">
          <v-card variant="outlined" rounded="xl" class="content-card pa-5 pa-md-6 h-100">
            <h3 class="content-card__title mt-0">{{ item.title }}</h3>
            <div class="rich-copy mt-3" v-html="item.descriptionHtml" />
            <div class="d-flex flex-wrap ga-2 mt-5">
              <v-chip v-for="tag in item.tags" :key="tag.name" size="small" variant="outlined">
                {{ tag.name }}
              </v-chip>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </section>
  </section>
</template>
