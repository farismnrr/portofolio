<script setup lang="ts">
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import {
  ArrowRight,
  BookOpen,
  Bot,
  CloudCog,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  Grid2X2,
  Home,
  Images,
  Lightbulb,
  Mail,
  MapPin,
  Moon,
  Radio,
  Server,
  Sun,
  Target,
  User,
  Users,
} from "@lucide/vue";
import { type Component, computed } from "vue";

const props = withDefaults(defineProps<{ name: string; size?: number }>(), {
  size: 18,
});

const lucideIcons: Record<string, Component> = {
  arrow: ArrowRight,
  bot: Bot,
  book: BookOpen,
  cloud: CloudCog,
  document: FileText,
  download: Download,
  email: Mail,
  external: ExternalLink,
  gallery: Images,
  globe: Globe2,
  grid: Grid2X2,
  home: Home,
  lightbulb: Lightbulb,
  moon: Moon,
  pin: MapPin,
  person: User,
  radio: Radio,
  server: Server,
  sun: Sun,
  target: Target,
  users: Users,
};

const brandIcons = {
  github: faGithub,
  linkedin: faLinkedin,
} as const;

const brandIcon = computed(() => brandIcons[props.name as keyof typeof brandIcons]);
const brandPath = computed(() => {
  const path = brandIcon.value?.icon[4];
  return typeof path === "string" ? path : (path?.join(" ") ?? "");
});
const brandViewBox = computed(() => {
  const icon = brandIcon.value?.icon;
  return icon ? `0 0 ${icon[0]} ${icon[1]}` : "0 0 24 24";
});
const lucideIcon = computed(() => lucideIcons[props.name] ?? ArrowRight);
</script>

<template>
  <svg
    v-if="brandIcon"
    :width="size"
    :height="size"
    :viewBox="brandViewBox"
    fill="currentColor"
    aria-hidden="true"
  >
    <path :d="brandPath" />
  </svg>
  <component
    :is="lucideIcon"
    v-else
    :size="size"
    :stroke-width="1.8"
    aria-hidden="true"
  />
</template>
