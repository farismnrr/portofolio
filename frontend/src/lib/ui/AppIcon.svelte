<script lang="ts">
  import {
    IconArrowLeft,
    IconArticle,
    IconBrandGithub,
    IconBrandLinkedin,
    IconBriefcase2,
    IconCertificate,
    IconFileText,
    IconHome2,
    IconMail,
    IconMapPin,
    IconPhoto,
    IconSun,
    IconUser,
    IconWorld
  } from '@tabler/icons-svelte-runes';

  type IconName =
    | 'github'
    | 'linkedin'
    | 'sun'
    | 'mail'
    | 'map-pin'
    | 'globe'
    | 'file-text'
    | 'arrow-left'
    | 'home'
    | 'about'
    | 'projects'
    | 'blog'
    | 'certifications'
    | 'gallery';

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
