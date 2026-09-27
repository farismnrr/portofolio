<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import type { Project } from "../content/types";
import AppIcon from "./AppIcon.vue";

const props = defineProps<{ project: Project; priority?: boolean }>();

const mediaElement = ref<{ $el: Element } | null>(null);
const deferredVisible = ref(false);
let mediaObserver: IntersectionObserver | undefined;

onMounted(() => {
  if (props.priority || typeof IntersectionObserver === "undefined") {
    deferredVisible.value = true;
    return;
  }

  mediaObserver = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return;
    deferredVisible.value = true;
    mediaObserver?.disconnect();
  });

  if (mediaElement.value?.$el) mediaObserver.observe(mediaElement.value.$el);
});

onBeforeUnmount(() => mediaObserver?.disconnect());
</script>
<template>
  <v-card tag="article" class="project-card" variant="flat" color="transparent">
    <RouterLink ref="mediaElement" :to="`/projects/${project.slug}`" class="project-card__media">
      <v-img
        class="project-card__image"
        :class="{ 'project-card__image--deferred': !priority && !deferredVisible }"
        :src="project.images[0]"
        :alt="project.title"
        eager
        aspect-ratio="16/9"
        cover
      />
    </RouterLink>
    <div class="project-card__body">
      <div>
        <h2><RouterLink :to="`/projects/${project.slug}`">{{ project.title }}</RouterLink></h2>
        <div v-if="project.organization || project.role" class="project-card__context">
          <span v-if="project.organization">{{ project.organization }}</span>
          <span v-if="project.organization && project.role" aria-hidden="true">·</span>
          <span v-if="project.role">{{ project.role }}</span>
        </div>
      </div>
      <div class="project-card__copy">
        <div class="project-card__avatars" v-if="project.team?.length">
          <v-avatar
            v-for="member in project.team.slice(0, 3)"
            :key="member.name"
            :image="member.avatar"
            :aria-label="member.name"
            size="30"
          />
        </div>
        <p>{{ project.summary }}</p>
        <div class="project-card__actions">
          <v-btn
            class="project-card__action"
            :to="`/projects/${project.slug}`"
            variant="plain"
            density="compact"
          >
            Read case study <AppIcon name="arrow" :size="15" />
          </v-btn>
          <v-btn
            v-if="project.link"
            class="project-card__action"
            :href="project.link"
            target="_blank"
            rel="noreferrer"
            variant="plain"
            density="compact"
          >
            View project <AppIcon name="external" :size="15" />
          </v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>
