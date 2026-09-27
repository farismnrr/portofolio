<script setup lang="ts">
const props = defineProps<{ name: string; size?: number }>();
const paths: Record<string, string[]> = {
  home: ["M3 11.5 12 4l9 7.5", "M5 10.5V20h14v-9.5", "M9 20v-6h6v6"],
  person: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M4 21a8 8 0 0 1 16 0"],
  grid: ["M4 4h6v6H4z", "M14 4h6v6h-6z", "M4 14h6v6H4z", "M14 14h6v6h-6z"],
  book: [
    "M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22z",
    "M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22z",
  ],
  document: ["M7 3h7l5 5v13H7z", "M14 3v6h6"],
  gallery: ["M4 5h16v14H4z", "M8 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z", "m5 6 3-3 4 4 2-2 3 3"],
  sun: [
    "M12 4V2",
    "M12 22v-2",
    "m4.93 4.93-1.42-1.42",
    "m20.49 20.49-1.42-1.42",
    "M4 12H2",
    "M22 12h-2",
    "m4.93 19.07-1.42 1.42",
    "m20.49 3.51-1.42 1.42",
    "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
  ],
  moon: ["M20.5 14.5A8 8 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"],
  github: [
    "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.4 5.4 0 0 0 19.3 4 5 5 0 0 0 19.2 1S18 0 15 2.5a13.4 13.4 0 0 0-6 0C6 0 4.8 1 4.8 1A5 5 0 0 0 4.7 4a5.4 5.4 0 0 0-1.5 3.5c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 9 18v4",
    "M9 18c-4.5 2-5-2-7-2",
  ],
  linkedin: ["M6 9v12", "M6 5v.01", "M10 21V9h4v2c1-2 7-2 7 3v7", "M3 9h6"],
  email: ["M3 5h18v14H3z", "m3 7 9 6 9-6"],
  arrow: ["M5 12h14", "m14-5 5 5-5 5"],
  external: ["M14 4h6v6", "M20 4 10 14", "M20 14v6H4V4h6"],
  globe: [
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    "M2 12h20",
    "M12 2a15 15 0 0 1 0 20",
    "M12 2a15 15 0 0 0 0 20",
  ],
  download: ["M12 3v12", "m7 10 5 5 5-5", "M5 21h14"],
  server: ["M4 5h16v5H4z", "M4 14h16v5H4z", "M8 7.5h.01", "M8 16.5h.01"],
  bot: ["M12 3v3", "M9 3h6", "M5 9h14v10H5z", "M8 13h.01", "M16 13h.01", "M9 17h6"],
  signal: ["M8.5 9.5a5 5 0 0 0 0 5", "M5.5 6.5a9 9 0 0 0 0 11", "M12 12h.01"],
  cloud: ["M7 18h10a4 4 0 0 0 .8-7.9A6 6 0 0 0 6.3 8.7 4.5 4.5 0 0 0 7 18Z"],
  pin: [
    "M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z",
    "M12 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  ],
  quote: ["M8 11H4a4 4 0 0 1 4-4v8H4", "M20 11h-4a4 4 0 0 1 4-4v8h-4"],
};
</script>

<template>
  <svg :width="props.size || 18" :height="props.size || 18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path v-for="d in (paths[props.name] || paths.arrow)" :key="d" :d="d" />
  </svg>
</template>
