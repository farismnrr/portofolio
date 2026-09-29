<script lang="ts">
  import {
    IconArrowLeft,
    IconBrandGithub,
    IconBrandLinkedin,
    IconFileText,
    IconMail,
    IconMapPin,
    IconSun,
    IconWorld
  } from '@tabler/icons-svelte-runes';

  type IconName = 'github' | 'linkedin' | 'sun' | 'mail' | 'map-pin' | 'globe' | 'file-text' | 'arrow-left';

  export let name: IconName;
  export let size = 18;
  export let strokeWidth = 1.8;
</script>

{#if name === 'github'}
  <IconBrandGithub {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'linkedin'}
  <IconBrandLinkedin {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'sun'}
  <IconSun {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'mail'}
  <IconMail {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'map-pin'}
  <IconMapPin {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'globe'}
  <IconWorld {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'file-text'}
  <IconFileText {size} stroke={strokeWidth} aria-hidden="true" />
{:else}
  <IconArrowLeft {size} stroke={strokeWidth} aria-hidden="true" />
{/if}
