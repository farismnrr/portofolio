<script lang="ts">
  import TechBadge from './TechBadge.svelte';
  import type { ProjectTechGroup } from '../project-content';

  export let items: string[];
  export let groups: ProjectTechGroup[] | undefined = undefined;
</script>

{#if groups?.length}
  <div class="space-y-4" aria-label="Technologies">
    {#each groups as group (group.label)}
      <section>
        <h4 class="mb-2 text-xs font-medium text-base-content/65">{group.label}</h4>
        <ul class="flex flex-wrap gap-2" aria-label={group.label}>
          {#each group.items as item (item)}
            <li><TechBadge name={item}/></li>
          {/each}
        </ul>
      </section>
    {/each}
  </div>
{:else}
  <ul class="flex flex-wrap gap-2" aria-label="Technologies">
    {#each items as item (item)}
      <li><TechBadge name={item}/></li>
    {/each}
  </ul>
{/if}
