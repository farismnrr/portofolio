<script lang="ts">
  import type { TocItem } from '../markdown';
  export let items: TocItem[] = [];
</script>

<aside class="hidden lg:block">
  <div class="sticky top-[104px]">
    <p class="text-[10px] font-semibold uppercase tracking-[.2em] text-black/46">On this page</p>
    <nav class="mt-4 border-l border-black/12">
      {#each items as item}
        <a class={"block border-l border-transparent py-2 pr-2 text-[12px] text-black/48 transition hover:border-[#405340] hover:text-black " + (item.level === 3 ? "pl-7" : "pl-4")} href={"#" + item.id}>{item.text}</a>
      {/each}
    </nav>
  </div>
</aside>
