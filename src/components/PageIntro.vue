<script setup lang="ts">
defineProps<{
  eyebrow: string;
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="page-intro">
    <div class="page-intro__eyebrow">{{ eyebrow }}</div>
    <h1>{{ title }}</h1>
    <p v-if="description">{{ description }}</p>
    <div v-if="$slots.actions" class="d-flex flex-wrap ga-3 mt-6">
      <slot name="actions" />
    </div>
  </div>
</template>
