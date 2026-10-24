<script lang="ts">
  import {
    IconArrowLeft,
    IconChevronLeft,
    IconChevronRight,
    IconX,
    IconArticle,
    IconBrandGithub,
    IconBrandLinkedin,
    IconBriefcase2,
    IconCertificate,
    IconFileText,
    IconHome2,
    IconMail,
    IconMapPin,
    IconMoon,
    IconPhoto,
    IconSun,
    IconUser,
    IconWorld
  } from '@tabler/icons-svelte-runes';

  type IconName =
    | 'github'
    | 'linkedin'
    | 'sun'
    | 'moon'
    | 'mail'
    | 'map-pin'
    | 'globe'
    | 'file-text'
    | 'arrow-left'
    | 'chevron-left'
    | 'chevron-right'
    | 'close'
    | 'home'
    | 'about'
    | 'projects'
    | 'blog'
    | 'certifications'
    | 'gallery';

  export let name: IconName | undefined = undefined;
  export let size = 18;
  export let strokeWidth = 1.8;
  export let brandPath: string | undefined = undefined;
  export let brandPaths: string[] | undefined = undefined;
  export let brandStroke = false;
</script>

{#if brandPaths}
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    class="shrink-0 fill-none stroke-current"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    {#each brandPaths as path}
      <path d={path}/>
    {/each}
  </svg>
{:else if brandPath}
  <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} class={`shrink-0 ${brandStroke ? 'fill-none stroke-current' : 'fill-current'}`} stroke-width={brandStroke ? 1.8 : undefined} stroke-linecap={brandStroke ? 'round' : undefined} stroke-linejoin={brandStroke ? 'round' : undefined}>
    <path d={brandPath}/>
  </svg>
{:else if name === 'close'}
  <IconX {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'chevron-left'}
  <IconChevronLeft {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'chevron-right'}
  <IconChevronRight {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'github'}
  <IconBrandGithub {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'linkedin'}
  <IconBrandLinkedin {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'sun'}
  <IconSun {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'moon'}
  <IconMoon {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'mail'}
  <IconMail {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'map-pin'}
  <IconMapPin {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'globe'}
  <IconWorld {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'file-text'}
  <IconFileText {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'home'}
  <IconHome2 {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'about'}
  <IconUser {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'projects'}
  <IconBriefcase2 {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'blog'}
  <IconArticle {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'certifications'}
  <IconCertificate {size} stroke={strokeWidth} aria-hidden="true" />
{:else if name === 'gallery'}
  <IconPhoto {size} stroke={strokeWidth} aria-hidden="true" />
{:else}
  <IconArrowLeft {size} stroke={strokeWidth} aria-hidden="true" />
{/if}
