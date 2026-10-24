<script lang="ts">
  import type { TocItem } from '../markdown';
  export let items: TocItem[] = [];
</script>

<aside class="hidden lg:block">
  <div class="sticky top-[104px]">
    <p class="text-[12px] font-medium text-black/60">Contents</p>
    <nav class="mt-3 border-l border-black/16">
      {#each items as item}
        <a class={"block rounded-lg border-l border-transparent px-2 py-2 text-[12px] text-black/60 transition hover:border-[var(--accent)] hover:text-black " + (item.level === 3 ? "pl-7" : "pl-4")} href={"#" + item.id}>{item.text}</a>
      {/each}
    </nav>
  </div>
</aside>
