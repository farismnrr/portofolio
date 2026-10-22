<script lang="ts">
  import { getTechIcon } from '../tech-icons';
  import AppIcon from './AppIcon.svelte';

  export let name: string;

  $: icon = getTechIcon(name);
</script>

{#if name === '-'}
  <span class="text-sm text-base-content/70">-</span>
{:else}
  <span class="badge badge-outline min-h-7 max-w-full rounded-lg gap-1.5 px-2.5 text-xs text-base-content/80">
    {#if icon?.strokePaths}
      <AppIcon brandPaths={icon.strokePaths} brandStroke size={14}/>
    {:else if icon?.assetSrc}
      <img src={icon.assetSrc} alt="" aria-hidden="true" width="14" height="14" class="shrink-0"/>
    {:else if icon}
      <AppIcon brandPath={icon.path} brandStroke={icon.custom} size={14}/>
    {/if}
    <span class="truncate">{name}</span>
  </span>
{/if}
