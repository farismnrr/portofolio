<script lang="ts">
  import AppIcon from './AppIcon.svelte';

  export let site: string;

  $: available = Boolean(site && site !== '-');
  $: label = available ? site.replace(/^https?:\/\//, '').replace(/\/$/, '') : '-';
</script>

{#if available}
  <a
    class="relative z-10 inline-flex min-h-11 min-w-0 max-w-full items-center gap-2 rounded-lg px-2 text-sm text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-base-content hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    href={site}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Visit ${label} in a new tab`}
  >
    <span class="min-w-0 truncate">{label}</span>
    <AppIcon name="globe" size={15}/>
  </a>
{:else}
  <span class="text-sm text-base-content/70">-</span>
{/if}
