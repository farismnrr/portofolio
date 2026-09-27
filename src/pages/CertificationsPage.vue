<script setup lang="ts">
import certifications from "virtual:content/certifications";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const groups = computed(() => Object.groupBy([...certifications], (item) => item.group));
const mobileInitiallyVisible = new Set(certifications.slice(0, 11).map((item) => item.title));
const visibleDeferred = ref(new Set<string>());
const cardElements = new Map<string, Element>();
let cardObserver: IntersectionObserver | undefined;

function registerCard(title: string, target: unknown) {
  if (!target) {
    cardElements.delete(title);
    return;
  }

  const candidate = target as { $el?: Element };
  const element = candidate.$el;
  if (element) cardElements.set(title, element);
}

function isDeferred(title: string) {
  return !mobileInitiallyVisible.has(title) && !visibleDeferred.value.has(title);
}

onMounted(() => {
  if (typeof IntersectionObserver === "undefined") {
    visibleDeferred.value = new Set(certifications.map((item) => item.title));
    return;
  }

  cardObserver = new IntersectionObserver((entries) => {
    const next = new Set(visibleDeferred.value);
    let changed = false;

    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const title = (entry.target as HTMLElement).dataset.certTitle;
      if (!title || next.has(title)) continue;
      next.add(title);
      changed = true;
      cardObserver?.unobserve(entry.target);
    }

    if (changed) visibleDeferred.value = next;
  });

  for (const item of certifications) {
    if (mobileInitiallyVisible.has(item.title)) continue;
    const element = cardElements.get(item.title);
    if (!element) continue;
    (element as HTMLElement).dataset.certTitle = item.title;
    cardObserver.observe(element);
  }
});

onBeforeUnmount(() => cardObserver?.disconnect());
</script>
<template>
  <section class="page page--wide">
    <h1 class="page-title">Certifications & Achievements</h1>
    <div v-for="(items, group) in groups" :key="group" class="cert-group">
      <h2>{{ String(group).replace(/\b\w/g, c => c.toUpperCase()) }}</h2>
      <div class="cert-grid">
        <v-card
          v-for="item in items"
          :key="item.title"
          :ref="(target) => registerCard(item.title, target)"
          class="cert-card"
          :href="item.pdf || item.image"
          target="_blank"
          rel="noreferrer"
          variant="flat"
          color="transparent"
        >
          <v-img
            class="cert-card__image"
            :class="{ 'cert-card__image--deferred': isDeferred(item.title) }"
            :src="item.image"
            :alt="item.title"
            aspect-ratio="4/3"
            eager
            cover
          />
          <span>{{ item.title }}</span>
        </v-card>
      </div>
    </div>
  </section>
</template>
