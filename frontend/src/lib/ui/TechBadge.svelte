<script lang="ts">
  import { getTechIcon } from '../tech-icons';
  import AppIcon from './AppIcon.svelte';

  export let name: string;

  $: icon = name === '-' ? undefined : getTechIcon(name);
</script>

{#if name === '-'}
  <span class="text-[11px] leading-4 text-[color-mix(in_srgb,var(--page-fg)_58%,transparent)]">-</span>
{:else}
<span class="inline-flex min-h-6 max-w-full items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--page-fg)_16%,transparent)] bg-[color-mix(in_srgb,var(--page-fg)_3%,var(--surface))] px-2 py-0.5 text-[11px] leading-4 text-[color-mix(in_srgb,var(--page-fg)_78%,transparent)]">
  {#if icon}
    <AppIcon brandPath={icon.path} size={14}/>
  {/if}
  <span class="truncate">{name}</span>
</span>
{/if}
