<script lang="ts">
  import TechBadge from './TechBadge.svelte';

  export let items: string[];
</script>

<ul class="flex flex-wrap gap-2" aria-label="Technologies">
  {#each items as item (item)}
    <li><TechBadge name={item}/></li>
  {/each}
</ul>
