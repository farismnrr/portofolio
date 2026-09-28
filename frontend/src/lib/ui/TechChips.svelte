<script lang="ts">
  export let items: string[] = [];
  export let pills = false;
</script>

<div class="flex flex-wrap items-center gap-x-5 gap-y-2">
  {#each items as item}
    {#if pills}
      <span class="badge border-0 bg-black/[0.045] px-3 py-3 text-[11px] font-normal text-black/60">{item}</span>
    {:else}
      <span class="text-[11px] text-black/55">{item}</span>
    {/if}
  {/each}
</div>
