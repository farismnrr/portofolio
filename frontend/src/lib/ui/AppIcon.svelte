<script lang="ts">
  import { ArrowLeft, FileText, Globe2, Mail, MapPin, Sun } from '@lucide/svelte';
  import SiGithub from '@icons-pack/svelte-simple-icons/icons/SiGithub';
  import SiLinkedin from '@icons-pack/svelte-simple-icons/icons/SiLinkedin';

  type IconName = 'github' | 'linkedin' | 'sun' | 'mail' | 'map-pin' | 'globe' | 'file-text' | 'arrow-left';

  export let name: IconName;
  export let size = 18;
  export let strokeWidth = 1.8;
</script>

{#if name === 'github'}
  <SiGithub {size} color="currentColor" />
{:else if name === 'linkedin'}
  <SiLinkedin {size} color="currentColor" />
{:else if name === 'sun'}
  <Sun {size} {strokeWidth} aria-hidden="true" />
{:else if name === 'mail'}
  <Mail {size} {strokeWidth} aria-hidden="true" />
{:else if name === 'map-pin'}
  <MapPin {size} {strokeWidth} aria-hidden="true" />
{:else if name === 'globe'}
  <Globe2 {size} {strokeWidth} aria-hidden="true" />
{:else if name === 'file-text'}
  <FileText {size} {strokeWidth} aria-hidden="true" />
{:else}
  <ArrowLeft {size} {strokeWidth} aria-hidden="true" />
{/if}
